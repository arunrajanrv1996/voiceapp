import navbar from "./navbar.js";
import footerr from "./footer.js";

const home = Vue.component("home", {
  template: `
    <div>
        <navbar></navbar>
        <div class="container">
        <div class="contain">
        <div class="container">
          <main>
          <h5 style="margin-bottom:30px;">{{starttext}}</h5>
          <button class="mic-toggle" :disabled="micdisable"  @click="toggleMic" ref="micBtn" style="border:none;" title="Click here to start recording">
            <img src="/static/js/images/record.png" width="120" height="120">
          </button>
          <div class="inputcontainer">
          <form @submit.prevent="submitFile">
            <label for="fileInput" class="file-label">Choose an audio file:</label>
            <div class="input-group">
              <input type="file" :disabled="filedisable" class="form-control" id="inputGroupFile04" aria-describedby="inputGroupFileAddon04" aria-label="Upload" ref="fileInput" @change="handleFileChange" accept="audio/*">
              <button class="submit-button1" :disabled="filedisable" type="submit" id="inputGroupFileAddon04">Submit Audio</button>
            </div>
          </form>
          </div>
          <div class="container">
          <select class="form-select" aria-label="Default select example" v-model="language" title="select the audio/recording language">
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
                <button @click="download(text)" v-if="showdownload" class="download-button" style="float:right;">
                  <i class="bi bi-download"></i> Download
                </button>
          </div>
        </div>
        <div class="container">
        <h2 style="margin-top:20px;">Transcriptions History</h2>
        <div class="transcript-window">
        <div class="transcript-container">
          <div
            v-for="transcript in usertranscript"
            :key="transcript.id"
            class="transcript-card"
          >
            <p>{{ transcript.text }}</p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
            {{ transcript.language }} | {{ transcript.created_on }} | <button @click="download(transcript.text)" class="download-button"><i class="bi bi-download"></i> Download</button>
            </p>
          </div>
          <div
            v-if="usertranscript.length === 0"
            class="transcript-card empty"
          >
            <p>{{ notranscript }}, If you are a not new user, Please login to see your History!</p>
          </div>
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
      starttext: "Click on the mic to start recording",
      micdisable: false,
      filedisable: false,
      text: "your text will appear here...",
      language: "English",
      loading: false,
      user_id: "",
      usertranscript: [],
      notranscript: "No transcript found",
      showdownload: false,
    };
  },
  mounted() {
    this.setUpAudio();
    if (localStorage.getItem("token")) {
      this.fetchtranscript();
      this.currentUser();
    }
  },
  methods: {
    currentUser() {
      const token = localStorage.getItem("token");
      fetch("/currentuser/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("No user found");
          }
        })
        .then((data) => {
          this.user_id = data.id;
        })
        .catch((error) => {
          this.user_id = "";
        });
    },
    download(text) {
      var element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(text)
      );
      element.setAttribute("download", "transcript.txt");
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    },
    fetchtranscript() {
      const token = localStorage.getItem("token");
      fetch("/usertranscript/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
                if (this.audio.size > 5000000) {
                  alert("Audio file size should be less than 5MB");
                  this.micdisable = false;
                  this.filedisable = false;
                  this.starttext = "Click on the mic to start recording";
                  this.audioChunks = [];
                  return;
                }
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
        this.filedisable = true;
        this.starttext = "Recording... click on the mic to stop recording";
        this.$refs.micBtn.classList.add("is-recording");
      } else {
        this.recorder.stop();
        this.micdisable = true;
        this.starttext = "Wait for a moment...";
        this.$refs.micBtn.classList.remove("is-recording");
      }
    },
    convertToText() {
      const formData = new FormData();
      formData.append("audio", this.audio); // Make sure this.audio contains the actual audio data
      formData.append("user_id", this.user_id);
      this.text = "";
      this.loading = true;
      this.showdownload = false;
      fetch("/speech/" + this.language, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            this.loading = false;
            this.micdisable = false;
            this.filedisable = false;
            this.showdownload = false;
            this.starttext = "Click on the mic to start recording";
            this.text = "something went wrong, Please try again";
            alert("something went wrong, Please try again");
          }
        })
        .then((data) => {
          this.loading = false;
          if (data.text == "File size is larger than 5 MB") {
            this.micdisable = false;
            this.filedisable = false;
            this.showdownload = false;
            this.starttext = "Click on the mic to start recording";
            this.text = "your text will appear here...";
            alert(data.text);
          } else {
            this.micdisable = false;
            this.filedisable = false;
            this.showdownload = true;
            this.starttext = "Click on the mic to start recording";
            this.text = data.text;
            this.fetchtranscript();
          }
        });
    },
    handleFileChange(event) {
      // Additional handling when the file input changes (optional).
    },
    submitFile() {
      const fileInput = this.$refs.fileInput;
      if (fileInput.files.length > 0) {
        const audioFile = fileInput.files[0];
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB in bytes
        if (audioFile.size > maxSizeInBytes) {
          alert("File size exceeds 5MB. Please select a smaller audio file.");
          return;
        }
        this.audio = audioFile;
        this.micdisable = true;
        this.filedisable = true;
        this.starttext = "Wait for a moment...";
        this.convertToText();
        this.$refs.fileInput.value = "";
      } else {
        alert("Please select an audio file");
      }
    },
  },
});

export default home;
