// Starting Animation
$(document).ready(function() {
    
});

// Cover will display and fade out on click showing original GUI
$("#cover").click(function(){
    $("#cover").fadeOut(100, function(){
        $("#cover").remove();
    });
})

$("#LFG").click(function(){
    $("#LFG").remove();
})