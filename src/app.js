import $ from 'cash-dom';
import './assets/scss/app.scss';
import { makeRequest, parseHttpError } from './utils';



export class App {
  initializeApp() {
    $('#user-search').on('submit', (evt) => this.onLoadProfile(evt));
    $('.input.username').on('invalid', (evt) => $('.input.username').addClass('is-danger'));
  }

  onLoadProfile(evt) {
    evt.preventDefault();

    const usernameInput = $('.username.input');
    const userName = usernameInput.val();
    usernameInput.removeClass('is-danger');

    makeRequest('GET', 'https://api.github.com/users/' + userName)
      .then(response => {
        if (response.status === 200) {
          this.getProfileErr = '';
          this.profile = response.body;
          this.updateProfile();
        } else {
          const err = parseHttpError(response);
          this.getProfileErr = err;
          this.setProfileError();
        }
      })
      .catch(err => {
        this.setProfileError();
      });
  }

  setProfileError() {
    const err = this.getProfileErr || 'An error occurred.';
    const errNotification = $('#profile-notification-error');
    errNotification.removeClass('is-hidden');
    errNotification.text(err);
    this.hideProfile();
  }

  hideProfile() {
    $('#profile-desc').addClass('is-hidden');
  }

  showProfile() {
    $('#profile-desc').removeClass('is-hidden');
  }

  updateProfile() {
    $('#profile-name').text(this.profile.login);
    $('#profile-image').attr('src', this.profile.avatar_url);
    $('#profile-url').attr('href', this.profile.html_url).text(this.profile.login);
    $('#profile-bio').text(this.profile.bio || '(no information)');
    this.showProfile();

    $('#profile-notification-error').addClass('is-hidden');
  }
}
