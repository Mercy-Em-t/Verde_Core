class ServiceCatalog:
    """
    Python Domain Object that encapsulates all business rules regarding Services,
    Add-ons, and pricing logic.
    """
    def __init__(self, db_connection):
        self.db = db_connection

    def get_all_services(self, include_inactive=False):
        with self.db() as conn:
            if include_inactive:
                rows = conn.run("SELECT Id, ServiceName, Description, Price, IsActive FROM Services")
            else:
                rows = conn.run("SELECT Id, ServiceName, Description, Price, IsActive FROM Services WHERE IsActive = TRUE")
            return [{"id": r[0], "name": r[1], "description": r[2], "price": float(r[3]) if r[3] else 0.0, "is_active": r[4]} for r in rows]

    def create_service(self, name: str, description: str, price: float):
        with self.db() as conn:
            res = conn.run("INSERT INTO Services (ServiceName, Description, Price, IsActive) VALUES (:n, :d, :p, TRUE) RETURNING Id",
                           n=name, d=description, p=price)
            return res[0][0]

    def update_service(self, service_id: int, name: str, description: str, price: float, is_active: bool):
        with self.db() as conn:
            conn.run("UPDATE Services SET ServiceName = :n, Description = :d, Price = :p, IsActive = :ia WHERE Id = :id",
                     n=name, d=description, p=price, ia=is_active, id=service_id)
            return True

    def calculate_project_quote(self, service_ids: list, apply_bulk_discount: bool = False):
        """
        Given a list of chosen Service IDs, queries their prices and calculates the total cost.
        Returns a tuple: (subtotal, list_of_service_names).
        Applies a 10% volume discount if apply_bulk_discount is True.
        """
        if not service_ids:
            return 0.0, []
            
        with self.db() as conn:
            # Query all selected services
            placeholders = ", ".join(str(s) for s in service_ids)
            rows = conn.run(f"SELECT ServiceName, Price FROM Services WHERE Id IN ({placeholders})")
            
        names = [r[0] for r in rows]
        subtotal = sum(float(r[1]) for r in rows if r[1])
        
        if apply_bulk_discount and len(service_ids) >= 3:
            return subtotal * 0.90, names
            
        return subtotal, names
