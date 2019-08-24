import $ from 'cash-dom';
import './assets/scss/app.scss';
import { makeRequest, parseHttpError } from './utils';
import { UserTimeline } from './event-timeline';


export class App {
  initializeApp() {
    this.timeline = new UserTimeline();
    $('#user-search').on('submit', (evt) => this.onLoadProfile(evt));
    $('.input.username').on('invalid', (evt) => $('.input.username').addClass('is-danger'));
  }

  onLoadProfile(evt) {
    evt.preventDefault();

    const usernameInput = $('.username.input');
    const userName = usernameInput.val();
    usernameInput.removeClass('is-danger');

    const promises = [
      this.getProfile(userName),
      this.getHistory(userName)
    ];

    this.hideProfile();
    this.hideTimeline();
    this.showIndicator();

    Promise.all(promises)
      .then(responses => {
        const [profileResponse, historyResponse] = responses;
        this.onGetProfileCompleted(profileResponse);
        this.onGetHistoryCompleted(historyResponse);

        $('#main-container').removeClass('is-hidden')
        this.hideIndicator();
      }).catch(err => {
        this.setProfileError();
        this.setHistoryError();

        $('#main-container').removeClass('is-hidden')
        this.hideIndicator();
      });
  }

  // #region http handlers

  onGetProfileCompleted(response) {
    if (response.status === 200) {
      this.getProfileErr = '';
      this.profile = response.body;
      this.updateProfile();
    } else {
      const err = parseHttpError(response);
      this.getProfileErr = err;
      this.setProfileError();
    }
  }

  onGetHistoryCompleted(response) {
    if (response.status === 200) {
      this.getProfileErr = '';
      this.eventsDef = response.body;
      this.createHistory();
    } else {
      const err = parseHttpError(response);
      this.getHistoryErr = err;
      this.setHistoryError();
    }
  }

  hideIndicator() {
    $('#spinner').addClass('is-hidden');
  }

  showIndicator() {
    $('#spinner').removeClass('is-hidden');
  }

  // #endregion

  // #region http calls

  getProfile(userName) {
    return makeRequest('GET', `https://api.github.com/users/${userName}`);
  }

  getHistory(userName) {
    return makeRequest('GET', `https://api.github.com/users/${userName}/events/public`);
  }

  // #endregion

  // #region history handling

  setHistoryError() {
    const err = this.getHistoryErr || 'An error occurred.';
    const errNotification = $('#timeline-notification-error');
    errNotification.removeClass('is-hidden');
    errNotification.text(err);
    this.hideTimeline();
  }

  hideTimeline() {
    $('#user-timeline').addClass('is-hidden');
  }

  showTimeline() {
    $('#user-timeline').removeClass('is-hidden');
  }

  createHistory() {
    this.timeline.initEvents(this.eventsDef);
    const html = this.timeline.timelineHtml;

    $('#user-timeline').html(html);
    this.showTimeline();

    $('#timeline-notification-error').addClass('is-hidden');
  }

  // #endregion

  // #region profile handling

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

  // #endregion
}
