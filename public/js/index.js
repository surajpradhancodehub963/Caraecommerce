document.querySelector('#hamburger').addEventListener("click",function(){
    document.querySelector("#nav_items").classList.add('active');
});

document.querySelector("#close_nav_list").addEventListener("click",function(){
    document.querySelector("#nav_items").classList.remove('active');
})