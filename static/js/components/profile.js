import navbar from "./navbar.js";
import footerr from "./footer.js";
const Profile = Vue.component("profile", {
  template: `
    <div>
    <navbar></navbar>
    <div class="profilecontain container">
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <div class="card profile-card">
            <div class="profile-header">
              <h4 class="profile-details">Profile</h4>
              <img :src="user.image" width="150" height="150" class="profile-image" v-if="user.image">
              <div v-else>
                <img src="/static/js/images/noimage.jpeg" width="150" height="150" class="profile-image">
              </div>
              <h5 class="profile-details">Username: {{user.username}}</h5>
              <h6 class="profile-details">Email: {{user.email}}</h6>
              <button class="upload-button" @click="showUploadForm">Update</button>
              <button class="cancel-button" @click="deleteaccount">Delete account</button>
              <div v-if="isModalVisible" class="custom-modal-overlay">
                <div class="custom-modal">
                  <div class="modal-header">
                    <h5 class="modal-title">Update Profile</h5>
                    <span @click="closeModal" class="close-btn">&times;</span>
                  </div>
                  <div class="modal-body">
                    <form @submit.prevent="updateprofile">
                      <div>
                      <label for="fileInput" class="form-label form-lable-update">Choose an image:</label>
                      <input type="file" class="form-control" @change="handleImageChange" accept="image/*">
                      <input type="submit" class="submit-button" value="Upload" style="margin-top:10px;">
                      </div>
                    </form>
                    <form @submit.prevent="updateprofilepassword">
                      <label for="password" class="form-label form-lable-update">Password:</label>
                      <input type="password" class="form-control" @input="validatePassword" placeholder="Password" v-model="formData.password" required>
                      <p class="error" style="color:red;" id="passwordError">{{ passwordError }}</p>
                      <label for="confirm_password" class="form-label form-lable-update">Confirm Password:</label>
                      <input type="password" class="form-control" placeholder="Confirm Password" v-model="formData.confirm_password" required>
                      <button type="submit" class="submit-button" :disabled="passwordError!=''" style="margin-top:10px;">Update</button>
                      <button type="button" @click="closeModal" class="cancel-button">Cancel</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      <div class="container">
      <h2 style="margin-top:20px;">Frequently Used Words</h2>
      <div class="card" style="margin-top:20px;">
        <div class="card-header">
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">Word</th>
                <th scope="col">Count (Your Usage)</th>
                <th scope="col">Count (All Users)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(count, word) in transcripts">
                <td>{{ word }}</td>
                <td>{{ count }}</td>
                <td>{{ othertranscripts[word] || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
    <div>
      <div class="container">
        <h2 style="margin-top:20px;">Unique Phrases</h2>
        <div class="card" style="margin-top:20px;">
            <div class="card-header">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Phrase</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="phrase in uniquephrases">
                    <td>{{ phrase }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>
      </div>
      <div class="container">
        <h2 style="margin-top:20px;">Similar Users</h2>
        <div class="card" style="margin-top:20px;">
            <div class="card-header">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Users</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in similarusers">
                    <td>{{ user }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>
        </div>
    </div>
    <footerr></footerr>
    </div>
    `,
  data() {
    return {
      user: {},
      similarusers: {},
      uniquephrases: {},
      transcripts: {},
      othertranscripts: {},
      isModalVisible: false,
      formData: {
        image: null,
        password: "",
        confirm_password: "",
      },
      passwordError: "",
      user_id: localStorage.getItem("user_id") || "",
    };
  },
  methods: {
    deleteaccount() {
      if (!confirm("Are you sure you want to delete your account?")) {
        return;
      }
      fetch(`/deleteuser/${this.user_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            alert("Account deleted successfully");
            localStorage.removeItem("user_id");
            this.$router.push("/");
            location.reload();
          } else {
            throw new Error("No user found");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    fetchSimilarUsers() {
      fetch(`/similarusers/${this.user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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
          this.similarusers = data["similar_users"];
        })
        .catch((error) => {
          console.log(error);
        });
    },
    fetchUniquePhrases() {
      fetch(`/useruniquephrases/${this.user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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
          this.uniquephrases = data["user_unique_phrases"];
        })
        .catch((error) => {
          console.log(error);
        });
    },
    fetchTranscripts() {
      fetch(`/usertranscriptanalysis/${this.user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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
          this.transcripts = data.frequent_words_user;
          this.othertranscripts = data.frequent_words_all_users;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    handleImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Set the base64-encoded image string in the profileData
          this.formData.image = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    showUploadForm() {
      // Show the modal when the "Update" button is clicked
      this.isModalVisible = true;
    },
    closeModal() {
      // Close the modal
      this.isModalVisible = false;
    },
    updateprofile() {
      if (!this.formData.image) {
        alert("Please select an image");
        return;
      }
      fetch(`/userprofile/${this.user_id}`, {
        method: "PUT",
        body: JSON.stringify(this.formData),
        headers: {
          "Content-Type": "application/json",
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
          this.user = data;
          alert("Profile Picture updated successfully");
          this.formData.image = null;
          this.closeModal();
          this.fetchuser();
        })
        .catch((error) => {
          alert("Profile Picture update failed");
          this.user = {};
        });
    },
    updateprofilepassword() {
      if (this.formData.password != this.formData.confirm_password) {
        alert("Passwords do not match");
        return;
      }

      fetch(`/userprofile/${this.user_id}`, {
        method: "PUT",
        body: JSON.stringify(this.formData),
        headers: {
          "Content-Type": "application/json",
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
          this.user = data;
          this.formData.image = null;
          this.formData.password = "";
          this.formData.confirm_password = "";
          alert("Password updated successfully");
          this.closeModal();
          this.fetchuser();
        })
        .catch((error) => {
          alert("Password update failed");
          this.user = {};
        });
    },
    fetchuser() {
      fetch(`/userprofile/${this.user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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
          this.user = data;
        })
        .catch((error) => {
          this.user = {};
        });
    },
    validatePassword() {
      const password = this.formData.password;
      // Check if the password has a length of at least 8 characters and contains at least one digit
      if (password.length < 8 || !/\d/.test(password)) {
        this.passwordError =
          "Password must be at least 8 characters long and contain at least one digit.";
      } else {
        this.passwordError = "";
      }
    },
  },
  mounted() {
    const token = localStorage.getItem("user_id");
    if (token) {
      this.fetchuser();
      this.fetchTranscripts();
      this.fetchUniquePhrases();
      this.fetchSimilarUsers();
    }
    if (!token) {
      this.$router.push("/login");
    }
  },
  components: {
    navbar,
    footerr,
  },
});

export default Profile;
