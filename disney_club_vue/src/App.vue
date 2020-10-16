<template>
  <v-app>
    <v-flex>
      <v-row justify="center">
        <v-card outlined>
          <!-- Title -->
          <v-row align="center" justify="center">
            <v-spacer></v-spacer>
            <v-card-title class="disney-text">
              Welcome to Disney Club's Bingo Game
            </v-card-title>
            <v-spacer></v-spacer>
            <v-btn
              class="mr-10"
              @click="open_login_alert = true"
            >
              Login
            </v-btn>
          </v-row>

          <!-- Login Popup -->
          <v-dialog v-model="open_login_alert" width="500">
            <v-card class="pa-5">
              <v-flex>
                <v-card-title>
                  Enter your netid
                </v-card-title>
                <v-row>
                  <v-col>
                    <v-text-field v-model="netid" label="netid"></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-btn @click="login()">
                      Enter
                    </v-btn>
                  </v-col>
                </v-row>
              </v-flex>
            </v-card>
          </v-dialog>

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
                    @change="fileUploaded(item, index1, index2)"
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
                  <v-img
                    position="center center"
                    src="http://localhost:8080/images/games/bingo/free.jpg"
                    v-if="index1 === 2 && index2 === 2"
                  >
                  </v-img>
                  <v-img
                    position="center center"
                    :src="`http://localhost:8080/images/games/bingo/${photos[index1][index2]}`"
                    :key="photos[index1][index2]"
                    v-else
                  >
                  </v-img>
                  <div :key="refresh"></div>
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

export default {
  computed: {
    photos: function() {
      return ([
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
      ])
    },
  },
  data: function() {
    return {
      // Set the cards accoring to what's in the json file.
      cards: [],
      windowSize: 0,
      button_height: 0,
      button_width: 0,
      file: null,
      open_login_alert: false,
      netid: "",
      refresh: false,
    };
  },
  methods: {
    fileUploaded: function(item, index1, index2) {
      let formData = new FormData();
      formData.append("file", this.file);

      api.post("upload", formData)
      .then(() => {
        // Update the json configuration once a response has been sent.
        this.cards[index1][index2].upload = this.file.name;

        let filepath = this.netid
        ? `json/games/bingo/${this.netid}/bingo_options.json`
        : "json/games/bingo/bingo_options.json";
        let payload = {
          filename: filepath,
          json: this.cards,
        };
        // Then update the configuration file on the server to match the
        // current instance.
        api.post("write", payload);
        api.get("photo", { params: { photo: this.file } })
        .then((response) => {
          this.photos[index1][index2] = response.data;
        })
        .catch((error) => { console.log(error) });
      });
    },
    login: function() {
      this.open_login_alert = false;

      api.get("user", { params: { netid: this.netid } })
        .then(() => {
          // User does exist, so we don't want to do anything.
          // Get the user's json configuration.
          api.get("find", { params: { netid: this.netid } })
            .then(async (response) => {
              this.cards = JSON.parse(response.data);

              for (let [index1, row] of this.cards.entries()) {
                for (let [index2, item] of row.entries()) {
                  if (item.upload) {
                    api.get("photo", { params: { photo: item.upload } })
                    .then((response) => {
                      this.photos[index1][index2] = response.data;
                    })
                    .catch((error) => { console.log(error) });
                  }
                }
              }
              setTimeout(() => { this.refresh = true; }, 2000);
            })
            .catch((error) => { console.log(error) });
        })
        .catch(() => {
          // User does not exist, so we want to create them.
          api.post("new", this.netid).then(() => {
            // Get the user's json configuration.
            api.get("find", { params: { netid: this.netid } })
              .then((response) => {
                this.cards = JSON.parse(response.data);
              })
              .catch((error) => { console.log(error) });
          });
        })
    },
    resize: function() {
      this.windowSize = window.innerWidth;
      this.button_width = (this.windowSize - 25) / 5;
      this.button_height = this.button_width;
    },
    transition: function(index1, index2) {
      if (!this.netid) {
        // Don't let users interact with the board if they're not logged in.
        return;
      }
      // Don't flip if the card has already been flipped.
      if (this.cards[index1][index2].flipped) {
        return;
      }
      this.cards[index1][index2].flipped = true;
      document.getElementById(`${index1}-${index2}`).classList.toggle("flip");
    }
  },
  mounted: function() {
    api.get("find", { params: { netid: "" } })
      .then((response) => {
        this.cards = JSON.parse(response.data)
      })
      .catch((error) => console.log(error));

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
