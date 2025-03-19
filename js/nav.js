function setActiveTab(contents, selectedContentType) {
    for (let key in contents) {
        const contentElementKey = contents[key]
        const contentElement = document.getElementById(contentElementKey);
        const link = document.querySelector(
            '.nav-link[onclick*="' + key + '"]'
        );

        if (key == selectedContentType) {
            contentElement.style.display = "block";

            link.classList.add("active");
            link.classList.remove("text-white");
        } else {
            contentElement.style.display = "none";

            link.classList.remove("active");
            link.classList.add("text-white");
        }
    }
}

window.setActiveTab = setActiveTab;
