<template>
  <div>
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
              <!-- Use NuxtLink for internal navigation to Index.vue -->
              <NuxtLink
                class="navbar-caption text-black text-primary display-7"
                to="/"
              >Newcastle LGBTQ Voice</NuxtLink>
            </span>
          </div>
          <button
            class="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-bs-toggle="collapse"
            data-target="#navbarSupportedContent"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <div class="hamburger">
              <span />
              <span />
              <span />
              <span />
            </div>
          </button>
          <div
            id="navbarSupportedContent"
            class="collapse navbar-collapse"
          >
            <ul
              class="navbar-nav nav-dropdown nav-right"
              data-app-modern-menu="true"
            >
              <li class="nav-item">
                <NuxtLink
                  class="nav-link link text-black text-primary display-4"
                  to="/"
                >
                  Home
                </NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink
                  class="nav-link link text-black text-primary display-4"
                  to="/news/"
                >
                  News
                </NuxtLink>
              </li>
              <li
                class="nav-item dropdown"
                @mouseover="toggleDropdown($event, true)"
                @mouseout="toggleDropdown($event, false)"
              >
                <NuxtLink
                  class="nav-link link text-black text-primary dropdown-toggle display-4"
                  data-toggle="dropdown-submenu"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                  aria-expanded="false"
                >
                  Letters to and from City Council
                </NuxtLink>
                <div
                  class="dropdown-menu"
                  aria-labelledby="dropdown-848"
                >
                  <NuxtLink
                    class="text-black text-primary dropdown-item display-4"
                    to="/letter/"
                  >
                    Open letter to the city council
                  </NuxtLink>
                  <NuxtLink
                    class="text-black text-primary dropdown-item display-4"
                    to="/reply-to-letter/"
                  >
                    Reply from Mayor Clark
                  </NuxtLink>
                </div>
              </li>
              <li class="nav-item">
                <NuxtLink
                  class="nav-link link text-black text-primary display-4"
                  to="/council-members/"
                >
                  Newcastle Council members
                </NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink
                  class="nav-link link text-black text-primary display-4"
                  to="/events/"
                >
                  Events
                </NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink
                  class="nav-link link text-black text-primary display-4"
                  to="/organizations/"
                >
                  Organizations
                </NuxtLink>
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
              © Copyright 2025 - All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  // Bootstrap resources are provided via the dedicated Nuxt plugin.
});

const toggleDropdown = (event, isOpen) => {
  if (typeof window === "undefined") {
    return;
  }

  const dropdown = event.currentTarget;

  if (!dropdown || !dropdown.classList) {
    return;
  }

  if (window.innerWidth > 991) {
    if (isOpen) {
      dropdown.classList.add("open");
    } else {
      dropdown.classList.remove("open");
    }
  }
};
</script>

<style scoped>
/* Scoped styles for the default layout */
</style>


