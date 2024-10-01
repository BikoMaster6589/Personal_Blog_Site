const popover = document.querySelector("#pop");
const pointer = document.querySelector(".newl");
const body = document.querySelector(".main");

popover.addEventListener("click",()=>{
if(pointer.style.display == "none"){
pointer.style.display  = "block";
}



else{
    pointer.style.display  = "none";
}

});

document.addEventListener("click", (event) => {
    // Check if the click is outside the popover and the pointer
    if (!popover.contains(event.target) && !pointer.contains(event.target)) {
        pointer.style.display = "none";
    }
});




