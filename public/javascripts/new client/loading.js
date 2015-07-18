$(document).on("click mobileinit" , function() {
    $.mobile.loader.prototype.options.text = "Loading…";
    $.mobile.loader.prototype.options.textonly = false;
    $.mobile.loader.prototype.options.textVisible = true;
    $.mobile.loader.prototype.options.theme = "b"; 
});