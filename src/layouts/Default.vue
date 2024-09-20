<template>
  <div>
    <client-only>
      <!-- Common Header Section -->
      <section
        id="menu1-5"
        data-bs-version="5.1"
        class="menu menu1 cid-uf3PHBc1HH"
        once="menu"
      >
        <nav class="navbar navbar-dropdown navbar-fixed-top navbar-expand-lg">
          <div class="container">
            <div class="navbar-brand">
              <span class="navbar-caption-wrap">
                <!-- Use g-link for internal navigation to Index.vue -->
                <g-link
                  class="navbar-caption text-black text-primary display-7"
                  to="/"
                >Newcastle LGBTQ Voice</g-link>
              </span>
            </div>
            <div
              id="navbarSupportedContent"
              class="collapse navbar-collapse"
            >
              <ul
                class="navbar-nav nav-dropdown nav-right"
                data-app-modern-menu="true"
              >
                <li class="nav-item">
                  <g-link
                    class="nav-link link text-black text-primary display-4"
                    to="/"
                  >
                    Home
                  </g-link>
                </li>
                <li class="nav-item">
                  <g-link
                    class="nav-link link text-black text-primary display-4"
                    to="/news/"
                  >
                    News
                  </g-link>
                </li>
                <li
                  class="nav-item dropdown"
                  @mouseover="toggleDropdown($event, true)"
                  @mouseout="toggleDropdown($event, false)"
                >
                  <g-link
                    class="nav-link link text-black text-primary dropdown-toggle display-4"
                    data-toggle="dropdown-submenu"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    aria-expanded="false"
                  >
                    Letters to and from City Council
                  </g-link>
                  <div
                    class="dropdown-menu"
                    aria-labelledby="dropdown-848"
                  >
                    <g-link
                      class="text-black text-primary dropdown-item display-4"
                      to="/letter/"
                    >
                      Open letter to the city council
                    </g-link>
                    <g-link
                      class="text-black text-primary dropdown-item display-4"
                      to="/reply-to-letter/"
                    >
                      Reply from Mayor Clark
                    </g-link>
                  </div>
                </li>
                <li class="nav-item">
                  <g-link
                    class="nav-link link text-black text-primary display-4"
                    to="/council-members/"
                  >
                    Newcastle Council members
                  </g-link>
                </li>
                <li class="nav-item">
                  <g-link
                    class="nav-link link text-black text-primary display-4"
                    to="/events/"
                  >
                    Events
                  </g-link>
                </li>
                <li class="nav-item">
                  <g-link
                    class="nav-link link text-black text-primary display-4"
                    to="/organizations/"
                  >
                    Organizations
                  </g-link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </section>
      <!-- Slot for Page Content -->
      <slot />

      <section
        id="footer7-6"
        data-bs-version="5.1"
        class="footer7 cid-uf3PMfXKLP"
        once="footers"
      >
        <div class="container">
          <div class="media-container-row align-center mbr-white">
            <div class="col-12">
              <p class="mbr-text mb-0 mbr-fonts-style display-7">
                © Copyright 2024 - All Rights Reserved
              </p>
            </div>
          </div>
        </div>
      </section>
    </client-only>
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout',
  mounted() {
    window.bootstrap = require('~/assets/bootstrap/js/bootstrap.bundle.min.js');
    // window.dropdown = require('~/assets/dropdown/js/navbar-dropdown.js');
    // window.smoothscroll = require('~/assets/smoothscroll/smooth-scroll.js');
    // window.ytplayer = require('~/assets/ytplayer/index.js');
    // window.theme = require('~/assets/theme/js/script.js');
  },
  methods: {
    toggleDropdown(event, isOpen) {
      const dropdown = event.currentTarget;
      if (window.innerWidth > 991) { // Optional: Limit to desktop screens
        if (isOpen) {
          dropdown.classList.add('open');
        } else {
          dropdown.classList.remove('open');
        }
      }
    }
  }
};
</script>

<style scoped>
/* Add any global styles here */
</style>

<static-query>

</static-query>


