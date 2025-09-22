import { defineNuxtPlugin } from "#app";
import "~/assets/bootstrap/js/bootstrap.bundle.min.js";

export default defineNuxtPlugin(() => {
  // Bootstrap bundle registers itself on the global window object.
});
