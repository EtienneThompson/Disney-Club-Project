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
            v-for="(row, index1) of cards"
            :key="'row ' + index1"
          >
            <div v-for="(item, index2) in row" :key="item.text">
              <v-card class="ma-0 pa-0" outlined>
                <!-- Front face -->
                <v-btn
                  class="btn-wrap no-text-transform front"
                  @click="transition(index1, index2)"
                  v-bind:id="index1 + '-' + index2"
                  :height="button_height"
                  :width="button_width"
                  v-if="!item.flipped && !item.upload"
                >
                  <!-- Mobile text -->
                  <span
                    class="disney-text mobile front"
                    :style="{ color:item.color }"
                    v-if="windowSize < 500"
                  >
                    {{ item.text }}
                  </span>
                  <!-- Tablet, Laptop, and Desktop text -->
                  <span
                    class="disney-text desktop front"
                    :style="{ color:item.color }"
                    v-else
                  >
                    {{ item.text }}
                  </span>
                </v-btn>

                <!-- Back face -->
                <div
                  :style="{ height:button_height + 'px', width:button_width + 'px' }"
                  v-if="item.flipped && !item.upload"
                >
                  <v-file-input
                    @change="fileUploaded(index1, index2)"
                    hide-input
                    v-model="file"
                  >
                  </v-file-input>
                </div>

                <!-- Uploaded image -->
                <div
                  :style="{ height:button_height + 'px', width:button_width + 'px' }"
                  v-if="item.flipped && item.upload"
                >
                  <v-img :src="require(`./resources/static/assets/uploads/${item.upload}`)"></v-img>
                </div>
              </v-card>
            </div>
          </v-row>
        </v-card>
      </v-row>
    </v-flex>
  </v-app>
</template>

<script>

import api from "@/api";
import bingoCards from "@/json/games/bingo/bingo_options.json"

export default {
  components: {
  },
  data: function() {
    return {
      // Set the cards accoring to what's in the json file.
      cards: bingoCards,
      windowSize: 0,
      button_height: 0,
      button_width: 0,
      file: null,
    };
  },
  methods: {
    fileUploaded: function(index1, index2) {
      let formData = new FormData();
      formData.append("file", this.file);

      api.post("upload", formData);

      this.cards[index1][index2].upload = this.file.name;
      let payload = {
        filename: "/json/games/bingo/bingo_options.json",
        json: this.cards,
      }
      api.post("write", payload);
    },
    resize: function() {
      this.windowSize = window.innerWidth;
      this.button_width = (this.windowSize - 25) / 5;
      this.button_height = this.button_width;
    },
    transition: function(index1, index2) {
      // Don't flip if the card has already been flipped.
      if (this.cards[index1][index2].flipped) {
        return;
      }
      this.cards[index1][index2].flipped = true;
      document.getElementById(`${index1}-${index2}`).classList.toggle("flip");
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

  // Setup horizontal flip transition.
  .flip {
    transform: rotateY(180deg);
    transition: 0.4s;
  }

  .front, .back {
    backface-visibility: hidden;
  }

</style>
