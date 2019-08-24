import { formatDate } from './utils';

const allowedEventTypes = ['PullRequestEvent', 'PullRequestReviewCommentEvent'];

export class UserTimeline {
    initEvents(eventsDef) {
        this.eventsDef = eventsDef.filter(ev => allowedEventTypes.some(allowed => allowed === ev.type)) || [];
        const events = [];
        for (const eventDef of this.eventsDef) {
            const event = {};

            switch (eventDef.type) {
                case 'PullRequestEvent':
                    event.contentTemplate = this.generatePRTemplate(eventDef, eventDef.actor);
                    break;
                case 'PullRequestReviewCommentEvent':
                    event.contentTemplate = this.generatePRCommentTemplate(eventDef, eventDef.actor);
                    break;
                default:
                    event.contentTemplate = `<p> Unkown event type '${eventDef.type}' </p>`;
            }

            event.createdAt = formatDate(new Date(eventDef.created_at));
            event.createdAtDate = new Date(eventDef.created_at);
            event.avatarUrl = eventDef.actor.avatar_url;
            event.eventDef = eventDef;
            events.push(event);
        }

        this.events = events.sort((a, b) => a.createdAtDate > b.createdAtDate ? 1 : -1);

        if (this.events.length > 0) {
            this.events[0].isPrimary = true;
        }

        this.timelineHtml = events.map(ev => this.generateTimelineEvent(ev)).join('\n');
    }

    generateTimelineEvent(event) {
        return `
        <div class="timeline-item ${event.isPrimary ? 'is-primary' : ''}" >
            <div class="timeline-marker ${event.isPrimary ? 'is-primary' : ''}"></div>
            <div class="timeline-content">
                <p class="heading">${event.createdAt}</p>
                <div class="content">

                    <div class="media">

                        <div class="media-left">
                            <span class="gh-username">
                                <img src="${event.avatarUrl}" />
                            </span>
                        </div>

                        ${event.contentTemplate}

                    </div>

                </div>
            </div>
        </div >
        `;
    }

    generatePRTemplate(eventDef, actor) {
        const pullRequest = eventDef.payload.pull_request;
        return `
        <div class="media-content">
            ${this.getUserTemplate(actor)}
            ${pullRequest.state}
            <a href="${pullRequest.html_url}">pull request</a>
            ${this.getRepoTemplate(eventDef)}
        </div>
`;
    }

    generatePRCommentTemplate(eventDef, actor) {
        const comment = eventDef.payload.comment;
        return `
        <div class="media-content">
            ${this.getUserTemplate(actor)}
            created
            <a href="${comment.html_url}">comment</a>
            to
            <a href="${comment.url}">pull request</a>
            ${this.getRepoTemplate(eventDef)}
        </div>  
`;
    }

    getUserTemplate(actor) {
        return `<a href="https://github.com/${actor.login}">${actor.display_login}</a>`;
    }

    getRepoTemplate(eventDef) {
        return `
        <p class="repo-name">
            <a href="${eventDef.repo.url}">${eventDef.repo.name}</a>
        </p>
        `;
    }
}

export const timelineEvent = {
    isPrimary: false,
    createdAt: new Date(),
    avatarUrl: '',
    createdAtDate: '',
    contentTemplate: '',
    eventDef: {}
};