import navbar from "./navbar.js";
import footerr from "./footer.js";

const home = Vue.component("home", {
  template: `
    <div>
        <navbar></navbar>
        <div class="contain">
        <div class="container">
          <main>
          <button class="mic-toggle" @click="toggleMic" ref="micBtn" style="border:none;" title="Click here to start recording">
            <img src="/static/js/images/record.png" width="120" height="120">
          </button>
          <div class="inputcontainer">
          <form @submit.prevent="submitFile">
            <label for="fileInput" class="file-label">Choose an audio file:</label>
            <input type="file" id="fileInput" ref="fileInput" @change="handleFileChange" accept="audio/*" />
            <button type="submit" class="submit-button">Submit Audio</button>
          </form>
          </div>
          <div class="container">
          <select class="form-select" aria-label="Default select example" v-model="language" title="select the audio/recording language">
            <option selected>Choose a language</option>
            <option value="English">English</option>
            <option value="Tamil">Tamil</option>
            <option value="German">German</option>
            <option value="French">French</option>
            <option value="Spanish">Spanish</option>
            <option value="Italian">Italian</option>
            <option value="Russian">Russian</option>
            <option value="Japanese">Japanese</option>
            <option value="Chinese">Chinese</option>
            <option value="Korean">Korean</option>
            <option value="Arabic">Arabic</option>
            <option value="Hindi">Hindi</option>
            <option value="Marathi">Marathi</option>
            <option value="Telugu">Telugu</option>
            <option value="Malayalam">Malayalam</option>
            <option value="Kannada">Kannada</option>
            <option value="Bengali">Bengali</option>
            <option value="Gujarati">Gujarati</option>
            <option value="Punjabi">Punjabi</option>
            <option value="Odia">Odia</option>
          </select>
          </div>
          </main>
          <div class="container text-window" title="converted text will appear here">
                <div class="card">
                  <p style="margin-left:10px; margin-top:10px;">{{text}}</p>
                  <span v-if="loading" class="load">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>  
                </span>
                </div>
          </div>
        </div>
        <div class="container">
        <h2 style="margin-top:20px;">Previous Transcripts</h2>
        <div class="transcript-window">
        <div class="transcript-container">
          <div
            v-for="transcript in usertranscript"
            :key="transcript.id"
            class="transcript-card"
          >
            <p>{{ transcript.text }}</p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
            {{ transcript.language }} | {{ transcript.created_on }}
            </p>
          </div>
          <div
            v-if="usertranscript.length === 0"
            class="transcript-card empty"
          >
            <p>{{ notranscript }}, If you are a not new user, Please login to see your Previous Transcripts!</p>
          </div>
        </div>
        </div>
        </div>
        </div>
        <footerr></footerr>
    </div>
    `,
  components: {
    navbar,
    footerr,
  },
  data() {
    return {
      audio: null,
      canRecord: false,
      isRecording: false,
      recorder: null,
      audioChunks: [],
      text: "your text will appear here...",
      language: "English",
      loading: false,
      user_id: localStorage.getItem("user_id") || "",
      usertranscript: [],
      notranscript: "No transcript found",
      token: localStorage.getItem("token") || "",
    };
  },
  mounted() {
    this.setUpAudio();
    if (localStorage.getItem("token")) {
      this.fetchtranscript();
    }
  },
  methods: {
    fetchtranscript() {
      fetch("/usertranscript/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token,
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("No transcript found");
          }
        })
        .then((data) => {
          this.usertranscript = data;
        })
        .catch((error) => {
          this.usertranscript = [];
        });
    },
    setUpAudio() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log("getUserMedia supported");
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            this.recorder = new MediaRecorder(stream);
            this.recorder.ondataavailable = (e) => {
              this.audioChunks.push(e.data);
              if (this.recorder.state === "inactive") {
                let blob = new Blob(this.audioChunks, { type: "audio/ogg" });
                this.audio = blob;
                this.convertToText();
                this.audioChunks = [];
              }
            };
            this.canRecord = true;
          })
          .catch((err) => {
            console.log("The following getUserMedia error occurred: " + err);
          });
      }
    },

    toggleMic() {
      if (!this.canRecord) {
        return;
      }
      this.isRecording = !this.isRecording;
      if (this.isRecording) {
        this.recorder.start();
        this.$refs.micBtn.classList.add("is-recording");
      } else {
        this.recorder.stop();
        this.$refs.micBtn.classList.remove("is-recording");
      }
    },
    convertToText() {
      const formData = new FormData();
      formData.append("audio", this.audio); // Make sure this.audio contains the actual audio data
      formData.append("user_id", this.user_id);
      this.text = "";
      this.loading = true;
      fetch("/speech/" + this.language, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            this.loading = false;
            alert("something went wrong, Please try again");
          }
        })
        .then((data) => {
          this.loading = false;
          this.text = data.text;
          this.fetchtranscript();
          console.log(data);
        });
    },
    handleFileChange(event) {
      // Additional handling when the file input changes (optional).
    },
    submitFile() {
      const fileInput = this.$refs.fileInput;
      if (fileInput.files.length > 0) {
        const audioFile = fileInput.files[0];
        this.audio = audioFile;
        this.convertToText();
      } else {
        alert("Something went wrong, Please select an audio file");
      }
    },
  },
});

export default home;
