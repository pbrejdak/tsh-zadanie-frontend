import $ from 'cash-dom';
import './assets/scss/app.scss';
import { makeRequest } from './utils';



export class App {
  initializeApp() {
    let self = this;

    $('.load-username').on('click', function (e) {
      let userName = $('.username.input').val();

      makeRequest('GET', 'https://api.github.com/users/' + userName)
        .then(response => {
          if (response.status === 200) {
            self.profile = response.body;
            self.update_profile();
          } else {
            // handle error
          }
        })
        .catch(err => {
          // handle error
          console.error(err);
        });
    });

  }

  update_profile() {
    $('#profile-name').text(this.profile.login);
    $('#profile-image').attr('src', this.profile.avatar_url);
    $('#profile-url').attr('href', this.profile.html_url).text(this.profile.login);
    $('#profile-bio').text(this.profile.bio || '(no information)');
  }
}
