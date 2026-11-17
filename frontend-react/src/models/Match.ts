export interface Match {
    id?: number;
    tournamentId: number;
    teamAId: number;
    teamBId: number;
    // Convention du backend : -1 = match pas encore joué (valeur par défaut)
    scoreA?: number;
    scoreB?: number;
    playedAt?: Date;
}
