"use strict";

function createProfileLinks() {
    //<!--<li><a class="dropdown-item" href="/profile">Profilo utente</a></li>-->
     return`<div class="container">
            <img src="../../../images/svg/tab-icon.svg" alt="Profile Picture" id="profilePic">
            <form id="profileForm">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" value="Guest" required>
                <label for="email">Email</label>
                <input type="email" id="email" name="email" value="guest@example.com" required>
                <label for="password">Password</label>
                <input type="password" id="password" name="password" value="password123" required>
                <button type="button" id="logoutBtn">Logout</button>
            </form>
        </div>
   `;
}

export { createProfileLinks };