<template>
  <div>
    <section
      id="content4-1j"
      data-bs-version="5.1"
      class="content4 cid-uggBo6iBMD"
    >
      <div class="container">
        <div class="row justify-content-center">
          <div class="title col-md-12 col-lg-10">
            <h3 class="mbr-section-title mbr-fonts-style align-center mb-4 display-2">
              <strong>Newcastle Community Pride Celebration: A Triumph of Solidarity and Visibility</strong>
            </h3>
          </div>
        </div>
      </div>
    </section>

    <section
      id="slider2-1m"
      data-bs-version="5.1"
      class="slider2 cid-uggCyJ3UrA"
    >
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-md-10">
            <div
              :id="carouselId"
              class="carousel slide"
              data-interval="5000"
              data-bs-interval="5000"
            >
              <ol class="carousel-indicators">
                <li
                  v-for="(slide, index) in slides"
                  :key="slide.id"
                  :data-target="`#${carouselId}`"
                  :data-bs-target="`#${carouselId}`"
                  :data-slide-to="index"
                  :data-bs-slide-to="index"
                  :class="{ active: index === 0 }"
                />
              </ol>
              <div class="carousel-inner">
                <div
                  v-for="(slide, index) in slides"
                  :key="slide.id"
                  :class="['carousel-item slider-image item', { active: index === 0 }]"
                >
                  <div class="item-wrapper">
                    <img
                      class="d-block w-100"
                      :src="slide.image"
                      :alt="slide.alt"
                      loading="lazy"
                      decoding="async"
                    >
                  </div>
                </div>
              </div>
              <a
                class="carousel-control carousel-control-prev"
                role="button"
                data-slide="prev"
                data-bs-slide="prev"
                :href="`#${carouselId}`"
              >
                <span
                  class="mobi-mbri mobi-mbri-arrow-prev"
                  aria-hidden="true"
                />
                <span class="sr-only visually-hidden">Previous</span>
              </a>
              <a
                class="carousel-control carousel-control-next"
                role="button"
                data-slide="next"
                data-bs-slide="next"
                :href="`#${carouselId}`"
              >
                <span
                  class="mobi-mbri mobi-mbri-arrow-next"
                  aria-hidden="true"
                />
                <span class="sr-only visually-hidden">Next</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      id="content5-1k"
      data-bs-version="5.1"
      class="content5 cid-uggBo6xfUF"
    >
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-12 col-lg-10">
            <p class="mbr-text mbr-fonts-style display-7">
              In an extraordinary demonstration of solidarity and support, Newcastle residents, alongside Eastside Pride PNW, PFLAG Bellevue/Eastside, and numerous other advocates, gathered for a historic event on June 18th. The occasion marked a pivotal moment in the community's commitment to LGBTQ+ visibility and inclusion.<br><br>
              <strong>A Peaceful and Celebratory Gathering</strong><br>
              The day began with a peaceful and celebratory assembly at Lake Boren Park. The event host had invited everyone to join in their "rainbow, colorful glory," emphasizing unity and respect. Attendees, dressed in vibrant colors, listened to speeches that echoed messages of love, compassion, and belonging. This sentiment resonated deeply with many, as one participant remarked, <em>"I love seeing the community support its LGBTQ neighbors!"</em><br><br>
              The event was wonderfully organized, featuring speakers from various LGBTQ+ organizations and council members who originally voted in favor of raising the Pride flag. Notably, one council member who had initially voted against it publicly acknowledged her mistake and expressed a desire to make amends.<br><br>
              Despite the event's positive atmosphere, it was marred by the presence of instigators. From "you all are going to hell" preachers to gender critics denying support to trans youth and right-wing "journalists" misrepresenting the event and harassing attendees, their provocations were relentless. At one point, these instigators surrounded and harassed a woman, but the community quickly came to her aid.<br><br>
              <strong>The March to City Hall</strong><br>
              Following the speeches, the crowd marched as a united front to Newcastle City Hall for the regular council meeting. The march itself was a vivid display of the community's commitment to LGBTQ+ visibility, aiming to fill the council chamber with pride and rainbows.<br><br>
              As the marchers arrived at city hall, they were met with counter-protesters, including aggressive religious nationalists and singers. Many marchers mentioned feeling intimidated by this group.<br><br>
              <strong>Reflections and Gratitude</strong><br>
              The success of the event was a testament to the power of community and the importance of standing together. Expressions of gratitude were widespread, with one participant stating, <em>"This was a great event, and I am so glad to have been a part of it. Deep thanks to the organizers and all those who showed up!"</em><br><br>
              As Newcastle residents reflect on this significant achievement, it is clear that the community's dedication to LGBTQ+ visibility and inclusion is stronger than ever. This event not only celebrated Pride but also underscored the importance of ongoing advocacy and the power of a united, loving community.<br><br>
              <strong>Looking Forward</strong><br>
              The Newcastle Community Pride Celebration is a shining example of what can be accomplished when a community comes together to support its members. As the Pride flag waves proudly over City Hall, it serves as a reminder of the progress made and the work that still lies ahead in the fight for equality and acceptance for all.<br><br>
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
/* global definePageMeta */
import { useSeoMeta } from '#imports';
import slideImage1 from '~/assets/images/20240618-171920.webp';
import slideImage2 from '~/assets/images/20240618-172453.webp';
import slideImage3 from '~/assets/images/20240618-174602.webp';
import slideImage4 from '~/assets/images/20240618-182448.webp';

defineOptions({
  name: 'NewcastlePrideCelebrationPage',
});

const pageTitle = 'Newcastle Community Pride Celebration | Newcastle LGBTQ Voice';
const pageDescription = 'Highlights from the Newcastle Community Pride Celebration, showcasing solidarity, visibility, and community resilience.';

definePageMeta({
  title: 'Newcastle Community Pride Celebration',
  description: pageDescription,
});

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
});

const carouselId = 'prideCelebrationCarousel';

const slides = [
  {
    id: 'celebration-slide-1',
    image: slideImage1,
    alt: 'Community members gather at the Newcastle Pride celebration, photo 1',
  },
  {
    id: 'celebration-slide-2',
    image: slideImage2,
    alt: 'Community members gather at the Newcastle Pride celebration, photo 2',
  },
  {
    id: 'celebration-slide-3',
    image: slideImage3,
    alt: 'Community members gather at the Newcastle Pride celebration, photo 3',
  },
  {
    id: 'celebration-slide-4',
    image: slideImage4,
    alt: 'Community members gather at the Newcastle Pride celebration, photo 4',
  },
];
</script>

<style scoped>
/* Add any custom component-specific styles here */
</style>
