let globalData = {
  name: 'John Doe',
  email: 'johndoe@example.com',
  address: '123 Main St',
  city: 'Anytown',
  state: 'CA',
  zip: '12345'
}

// document.cookie = '_fbc=fb.1.123.IwY2xjawK3G1xle'

// Function to update global variables
function updateData(key, value) {
  globalData[key] = value
}

// Get the cart count element
const cartCountElement = document.getElementById('cart-count')

// Initialize the cart
let cart = {}

// Function to update the cart count
function updateCartCount() {
  const cartCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0)
  cartCountElement.textContent = cartCount
}

// Function to add an item to the cart
function addToCart(id, name, price) {
  if (cart[name]) {
    cart[name].quantity++
  } else {
    cart[name] = { id, price, quantity: 1 }
  }
  updateCartCount()
  showNotification(`Added ${name} to cart!`)
  saveCartToLocalStorage()

  console.log('add to cart!')
  _pushToDatalayer({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'USD',
      value: price,
      items: [{
        item_id: id,
        item_name: name,
        price,
        quantity: 1
      }]
    }
  })
}

// Function to remove an item from the cart
function removeFromCart(name) {
  if (cart[name]) {
    delete cart[name]
  }
  updateCartCount()
  saveCartToLocalStorage()
}

// Function to save the cart to local storage
function saveCartToLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cart))
}

// Function to load the cart from local storage
function loadCartFromLocalStorage() {
  const storedCart = localStorage.getItem('cart')
  if (storedCart) {
    cart = JSON.parse(storedCart)
    updateCartCount()
  }
}

// Load the cart from local storage when the page loads
loadCartFromLocalStorage()

// Function to display the cart table
function displayCartTable() {
  const cartTableBody = document.getElementById('cart-body')
  cartTableBody.innerHTML = ''
  for (const name in cart) {
    const row = document.createElement('tr')
    const nameCell = document.createElement('td')
    nameCell.textContent = name
    row.appendChild(nameCell)
    const priceCell = document.createElement('td')
    priceCell.textContent = `$${cart[name].price}`
    row.appendChild(priceCell)
    const quantityCell = document.createElement('td')
    quantityCell.textContent = cart[name].quantity
    row.appendChild(quantityCell)
    const totalCell = document.createElement('td')
    totalCell.textContent = `$${cart[name].price * cart[name].quantity}`
    row.appendChild(totalCell)
    cartTableBody.appendChild(row)
  }

    // Calculate and display the cart total
  const total = getCartTotal()
  document.getElementById('cart-total').textContent = total.toFixed(2)
}

// Display the cart table when the cart page loads
if (document.getElementById('cart-table')) {
  displayCartTable()
}

// Function to initiate checkout
function initiateCheckout() {
    // Redirect to the checkout page
  window.location.href = 'checkout.html'
}

// Function to complete purchase
function completePurchase() {
  // console.log(globalData)

  // send data to GTM
  const purchaseDl = _formatPurchaseForDataLayer()
  _injectUserDataDl(purchaseDl)
  _pushToDatalayer(purchaseDl)
  console.log(purchaseDl)

  // Clear the cart
  cart = {}
  saveCartToLocalStorage()
  updateCartCount()

  // Redirect to the purchase confirmation page
  window.location.href = 'purchase-confirmation.html'
}

function showNotification(message) {
  const notification = document.createElement('div')
  notification.classList.add('notification')
  notification.innerHTML = `
        <span>${message}</span>
        <svg width="20" height="20" viewBox="0 0 20 20">
            <path d="M10 2C5.14 2 1 5.14 1 10s4.14 8 9 8 9-4.14 9-8S14.86 2 10 2z" fill="#fff" />
        </svg>
  `
  document.body.appendChild(notification)
  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// Function to get the total value of the cart
function getCartTotal() {
  let total = 0
  for (const name in cart) {
    total += cart[name].price * cart[name].quantity
  }
  return total
}

// Function to display the cart summary
function displayCartSummary() {
  const cartSummaryBody = document.getElementById('cart-summary-body')
  cartSummaryBody.innerHTML = ''
  for (const name in cart) {
    const row = document.createElement('tr')
    const productCell = document.createElement('td')
    productCell.textContent = name
    productCell.style.width = '40%'
    row.appendChild(productCell)
    const quantityCell = document.createElement('td')
    quantityCell.textContent = cart[name].quantity
    quantityCell.style.width = '20%'
    quantityCell.style.textAlign = 'center'
    row.appendChild(quantityCell)
    const totalCell = document.createElement('td')
    totalCell.textContent = `$${cart[name].price * cart[name].quantity}`
    totalCell.style.width = '40%'
    totalCell.style.textAlign = 'right'
    row.appendChild(totalCell)
    cartSummaryBody.appendChild(row)
  }
    // Calculate and display the cart total
  const total = getCartTotal()
  document.getElementById('cart-total').textContent = total.toFixed(2)
}
// Display the cart summary when the checkout page loads
if (document.getElementById('cart-summary-table')) {
  loadCartFromLocalStorage()
  displayCartSummary()
}

function _pushToDatalayer(data) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(data)
}
function _formatPurchaseForDataLayer() {
  const dl = {
    event: 'purchase',
    ecommerce: {
      value: 0,
      currency: 'USD',
      items: []
    }
  }
  for (const [name, data] of Object.entries(cart)) {
    const { id, price, quantity} = data
    dl.ecommerce.value += data.price
    dl.ecommerce.items.push({ item_id: id, item_name: name, quantity })
  }

  return dl
}
function _injectUserDataDl(dl) {
  dl.user_data = dl.user_data || {}
  const ud = dl.user_data

  ud.firstName = globalData.name?.split(' ')?.[0] || null
  ud.lastName = globalData.name?.split(' ')?.[1] || null
  ud.email = globalData.email
  ud.city = globalData.city
  ud.state = globalData.state
  ud.zip = globalData.zip
}