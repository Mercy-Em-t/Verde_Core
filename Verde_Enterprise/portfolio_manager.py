class PortfolioManager:
    def __init__(self, db_connection):
        self.db = db_connection

    def get_all(self, include_inactive=False):
        with self.db() as conn:
            if include_inactive:
                rows = conn.run("SELECT Id, Title, ClientName, Category, Description, Challenges, Solutions, TechStack, Timeline, ROI, ImageUrl, IsActive FROM Portfolio")
            else:
                rows = conn.run("SELECT Id, Title, ClientName, Category, Description, Challenges, Solutions, TechStack, Timeline, ROI, ImageUrl, IsActive FROM Portfolio WHERE IsActive = TRUE")
                
            return [{
                "id": r[0], "title": r[1], "client": r[2], "category": r[3],
                "description": r[4], "challenges": r[5], "solutions": r[6],
                "tech_stack": r[7], "timeline": r[8], "roi": r[9],
                "image_url": r[10], "is_active": r[11]
            } for r in rows]

    def get_by_id(self, p_id: int):
        with self.db() as conn:
            rows = conn.run("SELECT Id, Title, ClientName, Category, Description, Challenges, Solutions, TechStack, Timeline, ROI, ImageUrl, IsActive FROM Portfolio WHERE Id = :id", id=p_id)
            if not rows: return None
            r = rows[0]
            return {
                "id": r[0], "title": r[1], "client": r[2], "category": r[3],
                "description": r[4], "challenges": r[5], "solutions": r[6],
                "tech_stack": r[7], "timeline": r[8], "roi": r[9],
                "image_url": r[10], "is_active": r[11]
            }

    def create(self, data: dict):
        with self.db() as conn:
            res = conn.run('''
                INSERT INTO Portfolio (Title, ClientName, Category, Description, Challenges, Solutions, TechStack, Timeline, ROI, ImageUrl, IsActive)
                VALUES (:t, :c, :cat, :d, :ch, :s, :ts, :tl, :roi, :img, TRUE) RETURNING Id
            ''', t=data['title'], c=data.get('client', ''), cat=data.get('category', ''),
                 d=data.get('description', ''), ch=data.get('challenges', ''), s=data.get('solutions', ''),
                 ts=data.get('tech_stack', ''), tl=data.get('timeline', ''), roi=data.get('roi', ''), img=data.get('image_url', ''))
            return res[0][0]

    def update(self, p_id: int, data: dict):
        with self.db() as conn:
            conn.run('''
                UPDATE Portfolio SET Title = :t, ClientName = :c, Category = :cat, Description = :d,
                Challenges = :ch, Solutions = :s, TechStack = :ts, Timeline = :tl, ROI = :roi, ImageUrl = :img, IsActive = :ia
                WHERE Id = :id
            ''', t=data['title'], c=data.get('client', ''), cat=data.get('category', ''),
                 d=data.get('description', ''), ch=data.get('challenges', ''), s=data.get('solutions', ''),
                 ts=data.get('tech_stack', ''), tl=data.get('timeline', ''), roi=data.get('roi', ''), img=data.get('image_url', ''),
                 ia=data.get('is_active', True), id=p_id)
            return True
