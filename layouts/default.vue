<template>
  <div>
    <a
      href="#main"
      class="skip-link"
    >Skip to main content</a>
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
            <div
              class="hamburger"
              aria-hidden="true"
            >
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
                  to="/news"
                >
                  News
                </NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink
                  class="nav-link link text-black text-primary display-4"
                  to="/council-members"
                >
                  Newcastle Council members
                </NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink
                  class="nav-link link text-black text-primary display-4"
                  to="/events"
                >
                  Events
                </NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink
                  class="nav-link link text-black text-primary display-4"
                  to="/organizations"
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
    <main id="main">
      <slot />
    </main>

    <footer
      id="footer7-6"
      data-bs-version="5.1"
      class="footer7 cid-uf3PMfXKLP"
    >
      <div class="container">
        <div class="media-container-row align-center mbr-white">
          <div class="col-12">
            <p class="mbr-text mb-0 mbr-fonts-style display-7">
              © Copyright 2026 - All Rights Reserved
            </p>
            <p class="mbr-text mb-0 mbr-fonts-style display-7">
              <a
                href="/feed.xml"
                class="text-white"
              ><span
                class="socicon-rss"
                aria-hidden="true"
              /> RSS Feed</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 9999;
  padding: 0.5rem 1rem;
  background: #000;
  color: #fff;
  font-size: 1rem;
  text-decoration: none;
}

.skip-link:focus {
  top: 0;
}
</style>
