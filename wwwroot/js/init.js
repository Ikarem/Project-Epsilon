if (window.location.pathname.endsWith(".html")) {
    window.history.pushState(null, "", window.location.pathname.replace(".html", ""));
}