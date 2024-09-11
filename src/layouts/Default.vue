<template>
  <div>
    <!-- Common Header Section -->
    <section data-bs-version="5.1" class="menu menu1 cid-uf3PHBc1HH" once="menu" id="menu1-5">
      <nav class="navbar navbar-dropdown navbar-fixed-top navbar-expand-lg">
        <div class="container">
          <div class="navbar-brand">
            <span class="navbar-caption-wrap">
              <!-- Use g-link for internal navigation to Index.vue -->
              <g-link class="navbar-caption text-black text-primary display-7" to="/">Newcastle LGBTQ Voice</g-link>
            </span>
          </div>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav nav-dropdown nav-right" data-app-modern-menu="true">
              <li class="nav-item">
                <g-link class="nav-link link text-black text-primary display-4" to="/">Home</g-link>
              </li>
              <li class="nav-item">
                <g-link class="nav-link link text-black text-primary display-4" to="/news">News</g-link>
              </li>
              <li class="nav-item dropdown">
                <g-link
                    class="nav-link link text-black text-primary dropdown-toggle display-4"
                    data-toggle="dropdown-submenu"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    aria-expanded="false"
                >
                  Letters to and from City Council
                </g-link>
                <div class="dropdown-menu" aria-labelledby="dropdown-848">
                  <g-link
                      class="text-black text-primary dropdown-item display-4"
                      to="/letter"
                  >
                    Open letter to the city council
                  </g-link>
                  <g-link
                      class="text-black text-primary dropdown-item display-4"
                      to="/replyToLetter"
                  >
                    Reply from Mayor Clark
                  </g-link>
                </div>
              </li>
              <li class="nav-item">
                <g-link
                    class="nav-link link text-black text-primary display-4"
                    to="/councilmembers"
                >
                  Newcastle Council members
                </g-link>
              </li>
              <li class="nav-item">
                <g-link class="nav-link link text-black text-primary display-4" to="/events">Events</g-link>
              </li>
              <li class="nav-item">
                <g-link
                    class="nav-link link text-black text-primary display-4"
                    to="/organizations"
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
    <slot/>

    <section data-bs-version="5.1" class="footer7 cid-uf3PMfXKLP" once="footers" id="footer7-6">


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
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout'
}
</script>

<style scoped>
/* Add any global styles here */
</style>

<!--<static-query>-->
<!--query {-->
<!--  metadata {-->
<!--    siteName-->
<!--  }-->
<!--}-->
<!--</static-query>-->


