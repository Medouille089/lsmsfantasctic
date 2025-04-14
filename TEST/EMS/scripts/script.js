// Select the sidebar, close button, menu content, submenu items, and submenu titles
const sidebar = document.querySelector(".sidebar");
const sidebarClose = document.querySelector("#sidebar-close");
const menu = document.querySelector(".menu-content");
const menuItems = document.querySelectorAll(".submenu-item");
const subMenuTitles = document.querySelectorAll(".submenu .menu-title");

// Toggle the sidebar's closed state when the close button is clicked
sidebarClose.addEventListener("click", () => sidebar.classList.toggle("close"));

// Loop through each submenu item and add click event listeners
menuItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    // Activate submenu view by adding 'submenu-active' class to menu
    menu.classList.add("submenu-active");
    // Display the clicked submenu by adding 'show-submenu' class
    item.classList.add("show-submenu");

    // Hide other submenus by removing 'show-submenu' from non-clicked items
    menuItems.forEach((item2, index2) => {
      if (index !== index2) {
        item2.classList.remove("show-submenu");
      }
    });
  });
});

// Add click event listeners to submenu titles to close submenus
subMenuTitles.forEach((title) => {
  title.addEventListener("click", () => {
    // Remove 'submenu-active' class from menu to close all submenus
    menu.classList.remove("submenu-active");
  });
});


