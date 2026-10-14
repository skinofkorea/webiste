$ErrorActionPreference = 'Stop'

$storeUrl = 'https://www.miikorean.com'
$products = [System.Collections.Generic.List[object]]::new()
$page = 1
$pageSize = 250

function Get-ShopifyJson {
  param([string]$Uri)

  for ($attempt = 1; $attempt -le 5; $attempt++) {
    try {
      return Invoke-RestMethod -Uri $Uri -ErrorAction Stop
    } catch {
      $statusCode = 0
      if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
      }
      if ($statusCode -ne 429 -or $attempt -eq 5) {
        throw
      }

      $retryAfter = 0
      if (-not [int]::TryParse($_.Exception.Response.Headers['Retry-After'], [ref]$retryAfter)) {
        $retryAfter = [Math]::Min(30, $attempt * 2)
      }
      Start-Sleep -Seconds ([Math]::Max(1, $retryAfter))
    }
  }
}

while ($true) {
  $response = Get-ShopifyJson -Uri "$storeUrl/products.json?limit=$pageSize&page=$page"
  $pageProducts = @($response.products)
  if ($pageProducts.Count -eq 0) {
    break
  }

  foreach ($product in $pageProducts) {
    $variants = @($product.variants | ForEach-Object {
      [ordered]@{
        id = $_.id
        title = $_.title
        option1 = $_.option1
        option2 = $_.option2
        option3 = $_.option3
        price = $_.price
        compare_at_price = $_.compare_at_price
        available = $_.available
        sku = $_.sku
        featured_image = $_.featured_image.src
      }
    })

    $images = @($product.images | ForEach-Object {
      [ordered]@{
        id = $_.id
        src = $_.src
        alt = $_.alt
        width = $_.width
        height = $_.height
      }
    })

    $products.Add([ordered]@{
      id = $product.id
      title = $product.title
      handle = $product.handle
      body_html = $product.body_html
      vendor = $product.vendor
      product_type = $product.product_type
      published_at = $product.published_at
      tags = @($product.tags)
      variants = $variants
      images = $images
    })
  }

  if ($pageProducts.Count -lt $pageSize) {
    break
  }
  $page += 1
}

$collectionResponse = Get-ShopifyJson -Uri "$storeUrl/collections.json?limit=250"
$collections = @($collectionResponse.collections | ForEach-Object {
  $collection = $_
  $productHandles = [System.Collections.Generic.List[string]]::new()
  $collectionPage = 1

  while ($true) {
    Start-Sleep -Milliseconds 1100
    $collectionProductsResponse = Get-ShopifyJson -Uri "$storeUrl/collections/$($collection.handle)/products.json?limit=250&page=$collectionPage"
    $collectionProducts = @($collectionProductsResponse.products)
    foreach ($collectionProduct in $collectionProducts) {
      $productHandles.Add($collectionProduct.handle)
    }

    if ($collectionProducts.Count -lt 250) {
      break
    }
    $collectionPage += 1
  }

  [ordered]@{
    id = $collection.id
    title = $collection.title
    handle = $collection.handle
    description = $collection.body_html
    image = $collection.image.src
    published_at = $collection.published_at
    product_handles = @($productHandles)
  }
})

$pageResponse = Get-ShopifyJson -Uri "$storeUrl/pages.json?limit=250"
$pages = @($pageResponse.pages | ForEach-Object {
  [ordered]@{
    id = $_.id
    title = $_.title
    handle = $_.handle
    body_html = $_.body_html
    published_at = $_.published_at
  }
})

$catalog = [ordered]@{
  source = $storeUrl
  exported_at = [DateTime]::UtcNow.ToString('o')
  product_count = $products.Count
  collection_count = $collections.Count
  page_count = $pages.Count
  products = @($products)
  collections = $collections
  pages = $pages
}

$utf8 = [System.Text.UTF8Encoding]::new($false)
$json = ConvertTo-Json -InputObject $catalog -Depth 20
$outputPaths = @(
  (Join-Path $PSScriptRoot '..\client\public\miikorean-storefront.json'),
  (Join-Path $PSScriptRoot '..\api\data\miikorean-storefront.json')
)

foreach ($path in $outputPaths) {
  $outputPath = [System.IO.Path]::GetFullPath($path)
  $outputDirectory = [System.IO.Path]::GetDirectoryName($outputPath)
  [System.IO.Directory]::CreateDirectory($outputDirectory) | Out-Null
  [System.IO.File]::WriteAllText($outputPath, $json, $utf8)
  Write-Output "Exported $($products.Count) products, $($collections.Count) collections, and $($pages.Count) pages to $outputPath"
}
