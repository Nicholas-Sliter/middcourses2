import knex from '../lib/backend/database/knex';

function checkPermissions() {

    const today = new Date();

    // Note: this can create invalid dates, but it's not a big deal as they can still be compared
    const SIX_MONTHS_AGO = new Date();
    SIX_MONTHS_AGO.setMonth(SIX_MONTHS_AGO.getMonth() - 6);

    const usersAndReviews = knex('User')
        .where({
            'User.banned': false,
            'User.archived': false,
            'User.userType': 'student',
            'User.admin': false,
        })
        .fullOuterJoin('Review', 'User.userID', 'Review.reviewerID')
        .where({
            'Review.deleted': false,
            'Review.archived': false,
            'Review.approved': true,
            'Review.reviewDate': {
                '>=': SIX_MONTHS_AGO
            }
        })
        .groupBy('User.userID')
        .count('Review.reviewID as reviewCount')
        .select('User.userID', 'User.name', 'User.email', 'User.userType', 'User.role', 'reviewCount');

    for (const user of usersAndReviews) {
        let bool = false;

        if (user.userType === 'student') {
            if (user.reviewCount >= 2) {
                bool = true;
            }
        }

        knex('User')
            .where({
                'User.userID': user.userID
            })
            .update({
                'User.canReadReviews': bool
            });
    }

    return;
}

try {
    checkPermissions();
    console.log('Permissions checked successfully');

} catch (e) {
    console.log(e);
}