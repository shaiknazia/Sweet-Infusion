// // // document ready
$(() => {
  let cart = [];
  let orders = [];

  $(".add_to_cart").click(function () {
    let name = $(this).data("name");
    let price = $(this).data("price");
    let prep_time = $(this).data("prep_time");
    let id = $(this).parent().attr("id");
    addToCart(name, price, prep_time, id);
  });

  function addToCart(name, price, prep_time, id) {
    let itemIndex = getCartItemById(id);
    let quantity =
      cart[itemIndex] && cart[itemIndex].quantity
        ? cart[itemIndex].quantity + 1
        : 1;
    let tmp = { id, name, price, prep_time, quantity };
    if (itemIndex < 0) {
      cart.push(tmp);
    } else {
      cart[itemIndex] = tmp;
    }
    // console.log("Cart: ");
    // console.table(cart);
    renderCart();
  }

  function removeFromCart(id) {
    let itemIndex = getCartItemById(id);
    if (itemIndex >= 0) {
      let quantity = cart[itemIndex] ? cart[itemIndex].quantity - 1 : 0;
      if (quantity === 0) {
        //TODO, remove id from cart entirely
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].quantity = quantity;
      }
    }

    renderCart();
  }

  $("#order_form").on("click", ".subtractItem", function () {
    let id = $(this).data("id");
    removeFromCart(id);
  });

  $("#order_form").on("click", ".addItem", function (event) {
    let id = $(this).data("id");
    let itemIndex = getCartItemById(id);
    addToCart(
      cart[itemIndex].name,
      cart[itemIndex].price,
      cart[itemIndex].prep_time,
      id
    );
  });

  function getCartItemById(id) {
    return cart.findIndex((x) => parseInt(x.id) === parseInt(id));
  }

  function renderCart() {
    $("#cart-container").text("Add Items From Menu");

    let subtotal = 0;
    let total = 0;
    if (cart.length > 0) {
      $("#cart-container").empty();
      for (let item of cart) {
        subtotal += parseFloat(item.price) * parseFloat(item.quantity);
        total = subtotal * 1.13;
        let cartHtml =
          `<section class="cart flex">
                        <div order-buttons">
                          <input value='-' type='button' class='btn subtractItem' data-id=` +
          item.id +
          `>
                          <input type='text' disabled name='qty' value=${item.quantity} />
                          <input value='+' type='button' class='btn addItem' data-id=` +
          item.id +
          `>
                        </div>
                        <div class="flex">
                          <h5 class= "cart-item cart-item-name">${item.name}</h5>
                          <h5 class="cart-item cart-item-price">${item.price}</h5>
                        </div>
        </section>`;

        $("#cart-container").append(cartHtml);
        $("#cart").val(JSON.stringify(cart));
      }
    }
    $("#subtotal").html(subtotal.toFixed(2));
    $("#total").html(total.toFixed(2));
  }

  // JQUERY for restaurant-side
  function groupItemsByOrderId() {
    result = orders.reduce(function (r, a) {
      r[a.order_id] = r[a.order_id] || [];
      r[a.order_id].push(a);
      return r;
    }, Object.create(null));
    return result;
  }

  function renderPendingOrders() {
    $("#pending-orders").empty();
    //If the object (viewed as an array) has keys in it, then
    if (Object.keys(orders).length > 0) {
      let pendingHtml = "";
      for (let orderId in orders) {
        pendingHtml +=
          `<h3>Invoice ${orderId}
          <h4> Order Details </h4>` +
          orders[orderId][0].customer_name +
          `<h4> Number: ` +
          orders[orderId][0].customer_phone +
          `</h4>  </h3>`;
        //Looping through the orderID array
        for (let item of orders[orderId]) {
          pendingHtml += `<p class="item"> ${item.item} - Quantity ${item.quantity} </p>`;
        }
        pendingHtml +=
          `<input value='Complete Order' type='button' class='btn completeOrder' data-id=` +
          orderId +
          `><hr class="hr">`;
      }
      $("#pending-orders").append(pendingHtml);
    }
  }

  function markAsComplete(order_id) {
    $.post("/completeOrder", { order_id }).done(function (data) {
      // console.log(data);
      delete orders[order_id];
      renderPendingOrders();
    });
  }

  $("#pending-orders").on("click", ".completeOrder", function (event) {
    let order_id = $(this).data("id");
    markAsComplete(order_id);
  });

  function doPollForPendingOrders() {
    $.get("/pendingOrders", function (data) {
      orders = JSON.parse(data);
      orders = groupItemsByOrderId();
      // console.log("Grouped orders by Order ID: ");
      console.table(orders); // process results here
      renderPendingOrders();

      //Page will keep refreshing every 30s to see if any new orders have been added
      setTimeout(doPollForPendingOrders, 30000);
    });
  }
  doPollForPendingOrders();
});
