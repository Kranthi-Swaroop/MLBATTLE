const User = require('../models/User');

/**
 * ELO Rating System Service
 * Adapted from legacy Python implementation
 */
class EloService {
    /**
     * Calculate new ELO rating for a participant
     * 
     * @param {number} currentRating Current user ELO
     * @param {number} rank Participant rank in competition (1-indexed)
     * @param {number} totalParticipants Total participants in competition
     * @param {number} competitionWeight Weight of the competition (relative importance)
     * @returns {number} New ELO rating
     */
    static calculateNewRating(currentRating, rank, totalParticipants, competitionWeight = 1.0) {
        // Dynamic K-Factor based on competition size and weight
        const kFactor = 32 * competitionWeight * (Math.log10(totalParticipants + 1));

        // Calculate "Actual" score based on rank (1.0 for winner, 0.0 for last)
        const actualScore = totalParticipants > 1
            ? (totalParticipants - rank) / (totalParticipants - 1)
            : 1.0;

        // Calculate "Expected" score (Logistic distribution baseline)
        // We compare against an "average" opponent of 1200 ELO if it's their first time
        // or iterate through actual opponents (simplified version below)
        const expectedScore = 1 / (1 + Math.pow(10, (1200 - currentRating) / 400));

        // Simple ELO update formula
        const ratingChange = kFactor * (actualScore - expectedScore);

        return Math.round(currentRating + ratingChange);
    }

    /**
     * Process an entire competition and update participant ratings
     * 
     * @param {object} competition Competition document with populated leaderboard
     */
    static async processCompetitionRatings(competition) {
        if (!competition.leaderboard || competition.leaderboard.length === 0) {
            return { success: false, message: 'No leaderboard entries' };
        }

        const totalParticipants = competition.leaderboard.length;
        const weight = competition.ratingWeight || 1.0;
        const updates = [];

        for (const entry of competition.leaderboard) {
            if (entry.platformUser) {
                const user = await User.findById(entry.platformUser);
                if (user) {
                    const oldElo = user.elo || 1200;
                    const newElo = this.calculateNewRating(
                        oldElo,
                        entry.rank,
                        totalParticipants,
                        weight
                    );

                    user.elo = newElo;
                    user.competitionsParticipated = (user.competitionsParticipated || 0) + 1;
                    await user.save();

                    updates.push({
                        userId: user._id,
                        name: user.name,
                        oldElo,
                        newElo,
                        change: newElo - oldElo
                    });
                }
            }
        }

        return {
            success: true,
            participantsProcessed: updates.length,
            updates
        };
    }
}

module.exports = EloService;
