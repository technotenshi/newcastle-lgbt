// src/main.js
import DefaultLayout from '~/layouts/Default.vue';

// Function to set up global configurations
export default function (Vue, { head }) {
  // Register the default layout as a global component
  Vue.component('Layout', DefaultLayout);

  // Add meta tags globally
  head.meta.push({
    charset: 'UTF-8'
  });
  head.meta.push({
    'http-equiv': 'X-UA-Compatible',
    content: 'IE=edge'
  });
  head.meta.push({
    name: 'viewport',
    content: 'width=device-width, initial-scale=1, minimum-scale=1'
  });
  head.meta.push({
    name: 'description',
    content: ''
  });


    // Add Bootstrap CSS files globally
  head.link.push({
    rel: 'stylesheet',
    href: require('~/assets/bootstrap/css/bootstrap.min.css')
  });
  head.link.push({
    rel: 'stylesheet',
    href: require('~/assets/bootstrap/css/bootstrap-grid.min.css')
  });
  head.link.push({
    rel: 'stylesheet',
    href: require('~/assets/bootstrap/css/bootstrap-reboot.min.css')
  });

  // Add Dropdown CSS file globally
  head.link.push({
    rel: 'stylesheet',
    href: require('~/assets/dropdown/css/style.css')
  });

  // Add Socicon, Theme, and Mobirise CSS files globally
  head.link.push({
    rel: 'stylesheet',
    href: require('~/assets/socicon/css/styles.css')
  });
  head.link.push({
    rel: 'stylesheet',
    href: require('~/assets/theme/css/style.css')
  });

  // Preload Mobirise CSS file
  head.link.push({
    rel: 'preload',
    as: 'style',
    href: require('~/assets/mobirise/css/mbr-additional.css')
  });
  head.link.push({
    rel: 'stylesheet',
    href: require('~/assets/mobirise/css/mbr-additional.css'),
    type: 'text/css' // Specify the type attribute as in the original HTML
  });

  // Preload Google Font and apply styles
  head.link.push({
    rel: 'preload',
    href: 'https://fonts.googleapis.com/css?family=Jost:100,200,300,400,500,600,700,800,900,100i,200i,300i,400i,500i,600i,700i,800i,900i&display=swap',
    as: 'style',
    onload: "this.onload=null;this.rel='stylesheet'"
  });

  // Fallback for Google Font if JavaScript is disabled
  head.noscript.push({
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css?family=Jost:100,200,300,400,500,600,700,800,900,100i,200i,300i,400i,500i,600i,700i,800i,900i&display=swap'
  });


  // Add Bootstrap JavaScript file at the end of the body
  head.script.push({
    src: require('~/assets/bootstrap/js/bootstrap.bundle.min.js'),
    body: true
  });

  // Add Dropdown JavaScript file at the end of the body
  head.script.push({
    src: require('~/assets/dropdown/js/navbar-dropdown.js'),
    body: true
  });

  // Add Additional JavaScript files at the end of the body
  head.script.push({
    src: require('~/assets/smoothscroll/smooth-scroll.js'),
    body: true
  });
  head.script.push({
    src: require('~/assets/ytplayer/index.js'),
    body: true
  });
  head.script.push({
    src: require('~/assets/theme/js/script.js'),
    body: true
  });

  // Add Simple Analytics script at the end of the body
  head.script.push({
    src: 'https://scripts.simpleanalyticscdn.com/latest.js',
    async: true,
    defer: true,
    body: true
  });

  // Fallback for Simple Analytics if JavaScript is disabled
  head.noscript.push({
    tagName: 'img',
    attrs: {
      src: 'https://queue.simpleanalyticscdn.com/noscript.gif',
      alt: '',
      referrerpolicy: 'no-referrer-when-downgrade'
    }
  });
}
