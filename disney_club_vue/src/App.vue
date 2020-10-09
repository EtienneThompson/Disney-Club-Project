<template>
  <v-app>
    <v-flex>
      <v-row justify="center">
        <v-card outlined>
          <!-- Title -->
          <v-row justify="center">
            <v-card-title class="disney-text">
              Welcome to Disney Club's Bingo Game
            </v-card-title>
          </v-row>

          <!-- Bingo Board -->
          <v-row
            class="ma-0 pa-0"
            justify="center"
            v-for="(row, index1) of tasks"
            :key="row[0]"
          >
            <div v-for="(item, index2) in row" :key="item">
              <v-card class="ma-0 pa-0" outlined>
                <v-btn
                  class="btn-wrap no-text-transform"
                  :height="button_height"
                  :width="button_width"
                >
                  <span
                    class="disney-text mobile"
                    :style="{ color:colors[index1][index2] }"
                    v-if="windowSize < 500"
                  >
                    {{ item }}
                  </span>
                  <span
                    class="disney-text desktop"
                    :style="{ color:colors[index1][index2] }"
                    v-else
                  >
                    {{ item }}
                  </span>
                </v-btn>
              </v-card>
            </div>
          </v-row>
        </v-card>
      </v-row>
    </v-flex>
  </v-app>
</template>

<script>
export default {
  data: function() {
    return {
      tasks: [
        [
          "Watched Nightmare Before Christmas",
          "Made a Jack-O-Lantern",
          "Watched Hocus Pocus",
          "Wore Mickey Ears for a Day",
          "Halloween Craft"
        ],
        [
          "Entered A Contest",
          "Made a Halloween Treat",
          "Went to Disney Club!!!",
          "Bought Disney Halloween Merch",
          "Watched Haunted Mansion"
        ],
        [
          "Viewed Disney Club Insta Story",
          "Wore A Mask And Social Distanced",
          "Free",
          "Disney Costume",
          "Temp Below 60"
        ],
        [
          "Took A Test",
          "Watched 5 Things On Disney Plus",
          "Watched A Scary Movie on Halloween",
          "Bought a Bag of Candy",
          "Pulled a Prank"
        ],
        [
          "Anything Involving A Pumpkin",
          "Sent Disney Club a Halloween Picture",
          "Drew a Disney Character",
          "Played Villainous",
          "Participation in a Disney Club Poll"
        ],
      ],
      colors: [
        ["orange", "black", "orange", "black", "orange"],
        ["black", "orange", "black", "orange", "black"],
        ["orange", "black", "orange", "black", "orange"],
        ["black", "orange", "black", "orange", "black"],
        ["orange", "black", "orange", "black", "orange"],
      ],
      windowSize: 0,
      button_height: 0,
      button_width: 0,
    };
  },
  methods: {
    resize: function() {
      this.windowSize = window.innerWidth;
      console.log(this.windowSize)
      this.button_width = (this.windowSize - 25) / 5;
      this.button_height = this.button_width;
      console.log(this.button_width);
      console.log(this.button_height);
    }
  },
  mounted: function() {
    this.resize();
    window.addEventListener("resize", this.resize, { passive: true });
  }
}
</script>

<style lang="scss">
  // Setup Disney Text.
  @font-face {
    font-family: "Waltograph";
    src: local("Waltograph"),
      url(./fonts/Waltograph/waltographUI.ttf) format("truetype");
  }

  // Setup font and size on mobile and desktop.
  .disney-text {
    font-family: "Waltograph" !important;
    mobile {
      font-size: 8px;
    }

    desktop {
      font-size: 16px;
    }
  }

  // Make button content able to wrap.
  .v-btn__content { width: 100%; white-space: normal; }

</style>
