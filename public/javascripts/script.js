function addToCart(proId) {
  $.ajax({
    url: "/add-to-cart/" + proId,
    method: "get",
    success: (response) => {
      let count = $("#cart-count").html();
      if (count == null) {
        let count = 0;
        count = parseInt(count) + parseInt(1);
        $("#cart-count").html(count);
      } else {
        count = parseInt(count) + parseInt(1);
        $("#cart-count").html(count);
      }
    },
  });
}

function changeQuantity(cartId, proId, count) {
  let quantity = parseInt(document.getElementById(proId).innerHTML);
  console.log(quantity);
  $.ajax({
    url: "/change-quantity",
    data: {
      cartId: cartId,
      proId: proId,
      count: count,
      quantity: quantity,
    },
    method: "post",
    success: (response) => {
      if (response.removeProduct) {
        alert("Product deleted");
        location.reload();
      } else {
        document.getElementById(proId).innerHTML = quantity + parseInt(count);
      }
    },
  });
}

function removeCartProduct(cartId, proId) {
  $.ajax({
    url: "/remove-cart-product",
    data: {
      cartId: cartId,
      proId: proId,
    },
    method: "post",
    success: (response) => {
      alert("Product deleted");
      location.reload();
    },
  });
}
