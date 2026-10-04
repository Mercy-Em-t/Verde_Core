export default class ProjectAssessment {
    constructor() {
        this.status = 'PENDING';
        this.teamReviews = [];
        this.lessonsLearned = [];
    }

    addTeamReview(memberName, performance, notes) {
        this.teamReviews.push({ memberName, performance, notes });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    addLessonLearned(category, lesson) {
        this.lessonsLearned.push({ category, lesson });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    finalizeAssessment() {
        this.status = 'COMPLETED';
    }

    renderAsHTML() {
        const reviewsHtml = this.teamReviews.map(r => `<li><strong>${r.memberName} (${r.performance}):</strong> ${r.notes}</li>`).join('') || '<li>No team reviews.</li>';
        const lessonsHtml = this.lessonsLearned.map(l => `<li><strong>[${l.category}]</strong> ${l.lesson}</li>`).join('') || '<li>No lessons logged.</li>';
        
        return `
            <div style="border:1px solid #ccc;padding:15px;border-radius:5px;margin-bottom:20px;">
                <h4 style="margin-top:0;">3. Project Assessment (Post-Mortem)</h4>
                <p><strong>Status:</strong> ${this.status}</p>
                <h5>Team Reviews</h5>
                <ul>${reviewsHtml}</ul>
                <h5>Lessons Learned</h5>
                <ul>${lessonsHtml}</ul>
            </div>
        `;
    }
}
