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
            <v-btn class="mr-10" @click="login">
              Login
            </v-btn>
          </v-row>

          <!-- AWS Login Popup - Simple username only identification, not used 
          anymore. -->
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
          <v-row class="ma-0 pa-0" justify="center" v-for="(row, index1) of cards" :key="'row ' + index1">
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
                  <span class="disney-text mobile front" :style="{ color: item.color }" v-if="windowSize < 500">
                    {{ item.text }}
                  </span>
                  <!-- Tablet, Laptop, and Desktop text -->
                  <span class="disney-text desktop front" :style="{ color: item.color }" v-else>
                    {{ item.text }}
                  </span>
                </v-btn>

                <!-- Back face -->
                <div
                  :style="{ height: button_height + 'px', width: button_width + 'px' }"
                  v-if="item.flipped && !item.upload"
                >
                  <v-file-input @change="fileUploaded(item, index1, index2)" hide-input v-model="file"> </v-file-input>
                </div>

                <!-- Uploaded image -->
                <div
                  :style="{ height: button_height + 'px', width: button_width + 'px' }"
                  v-if="item.flipped && item.upload"
                >
                  <v-img position="center center" src="@/assets/free.jpg" v-if="index1 === 2 && index2 === 2"> </v-img>
                  <v-img
                    position="center center"
                    :src="`${photos[index1][index2]}`"
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
import bingo_options from "@/assets/bingo_options.json";

export default {
  computed: {
    photos: function() {
      return [
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
      ];
    },
  },
  data: function() {
    return {
      // Set the cards accoring to what's in the json file.
      cards: bingo_options,
      queryParams: {},
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
    /**
     * The following functions are written for the demo purposes.
     */
    login: function() {
      window.open(
        `${process.env.VUE_APP_LOGIN_ENDPOINT}/login?appid=${process.env.VUE_APP_APPLICATION_ID}&redirectBase=${process.env.VUE_APP_LOGIN_REDIRECT}`,
        "_self"
      );
    },
    fileUploaded: function(item, index1, index2) {
      this.cards[index1][index2].upload = this.file.name;
      this.photos[index1][index2] = URL.createObjectURL(this.file);
    },
    splitQueryParams: function() {
      /**
       * Get a list of the login query params.
       */
      let url = window.location.href.split("?");
      if (url.length === 2) {
        let params = url[1].split("&");
        for (let param of params) {
          let fields = param.split("=");
          if (fields.length === 2) {
            this.queryParams[fields[0]] = fields[1];
          }
        }
      }
      console.log(this.queryParams);
    },
    resize: function() {
      // Resize bingo board according to window size.
      this.windowSize = window.innerWidth;
      this.button_width = (this.windowSize - 25) / 5;
      this.button_height = this.button_width;
    },
    transition: function(index1, index2) {
      /**
       * Determine if the bingo item can be flipped over.
       */
      if (!this.queryParams["clientId"]) {
        // Don't let users interact with the board if they're not logged in.
        return;
      }
      // Don't flip if the card has already been flipped.
      if (this.cards[index1][index2].flipped) {
        return;
      }
      this.cards[index1][index2].flipped = true;
      document.getElementById(`${index1}-${index2}`).classList.toggle("flip");
    },

    /**
     * The following functions were written for when state needed to be stored
     * across sessions in AWS. For demo purposes, these are no longer used.
     */
    aws_fileUploaded: function(item, index1, index2) {
      let formData = new FormData();
      formData.append("file", this.file);

      api.post("upload", formData).then(() => {
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
        api
          .get("photo", { params: { photo: this.file } })
          .then((response) => {
            this.photos[index1][index2] = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
      });
    },
    aws_login: function() {
      this.open_login_alert = false;

      api
        .get("user", { params: { netid: this.netid } })
        .then(() => {
          // User does exist, so we don't want to do anything.
          // Get the user's json configuration.
          api
            .get("find", { params: { netid: this.netid } })
            .then(async (response) => {
              this.cards = JSON.parse(response.data);

              for (let [index1, row] of this.cards.entries()) {
                for (let [index2, item] of row.entries()) {
                  if (item.upload) {
                    api
                      .get("photo", { params: { photo: item.upload } })
                      .then((response) => {
                        this.photos[index1][index2] = response.data;
                      })
                      .catch((error) => {
                        console.log(error);
                      });
                  }
                }
              }
              setTimeout(() => {
                this.refresh = true;
              }, 2000);
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch(() => {
          // User does not exist, so we want to create them.
          api.post("new", this.netid).then(() => {
            // Get the user's json configuration.
            api
              .get("find", { params: { netid: this.netid } })
              .then((response) => {
                this.cards = JSON.parse(response.data);
              })
              .catch((error) => {
                console.log(error);
              });
          });
        });
    },
  },
  mounted: function() {
    this.splitQueryParams();
    this.resize();
    window.addEventListener("resize", this.resize, { passive: true });

    // eslint-disable-next-line no-constant-condition
    if (false) {
      /**
       * The following code was used to get the JSON configuration for the board
       * when the user first loaded the page.
       */
      api
        .get("find", { params: { netid: "" } })
        .then((response) => {
          this.cards = JSON.parse(response.data);
        })
        .catch((error) => console.log(error));
    }
  },
};
</script>

<style lang="scss">
// Setup Disney Text.
@font-face {
  font-family: "Waltograph";
  src: local("Waltograph"), url(./fonts/Waltograph/waltographUI.ttf) format("truetype");
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
.v-btn__content {
  width: 100%;
  white-space: normal;
}

// Setup horizontal flip transition.
.flip {
  transform: rotateY(180deg);
  transition: 1s;
}

.front,
.back {
  backface-visibility: hidden;
}
</style>
