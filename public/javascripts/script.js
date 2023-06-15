
  function addToCart(proId)
  {$.ajax({
    url: '/add-to-cart/' + proId,
    method: "get",
    success: (response) => {
      let count = $('#cart-count').html()
      count = parseInt(count)+1 
      $('#cart-count').html(count)
    },
  })}

  function changeQuantity(cartId,proId,count)
  {$.ajax({
    url:"/change-quantity",
    data:{
      cartId:cartId,
      proId:proId,
      count:count
    },
    method:"post",
    success:(response)=>{
      alert(response)
    }
  })}