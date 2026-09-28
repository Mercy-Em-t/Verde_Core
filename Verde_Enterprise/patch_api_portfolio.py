def run():
    with open('main_api.py', 'r', encoding='utf-8') as f:
        html = f.read()

    import_stmt = 'from portfolio_manager import PortfolioManager\n'
    if 'from portfolio_manager import PortfolioManager' not in html:
        html = html.replace('from service_catalog import ServiceCatalog', 'from service_catalog import ServiceCatalog\n' + import_stmt)

    endpoints = '''
# --- PORTFOLIO ---

@app.get("/api/portfolio")
def list_portfolio():
    mgr = PortfolioManager(get_db)
    return {"status": "success", "portfolio": mgr.get_all(include_inactive=False)}

@app.get("/api/portfolio/{p_id}")
def get_portfolio(p_id: int):
    mgr = PortfolioManager(get_db)
    p = mgr.get_by_id(p_id)
    if not p: raise HTTPException(status_code=404, detail="Project not found")
    return {"status": "success", "project": p}

@app.get("/api/admin/portfolio")
def admin_list_portfolio(user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    mgr = PortfolioManager(get_db)
    return mgr.get_all(include_inactive=True)

class PortfolioModel(BaseModel):
    title: str
    client: str = ""
    category: str = ""
    description: str = ""
    challenges: str = ""
    solutions: str = ""
    tech_stack: str = ""
    timeline: str = ""
    roi: str = ""
    image_url: str = ""
    is_active: bool = True

@app.post("/api/admin/portfolio")
def create_portfolio(data: PortfolioModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    mgr = PortfolioManager(get_db)
    p_id = mgr.create(data.dict())
    broker.publish({"type": "CREATE_PORTFOLIO", "actor": user.get("userid"), "entity_id": p_id, "title": data.title})
    return {"status": "success", "id": p_id}

@app.patch("/api/admin/portfolio/{p_id}")
def update_portfolio(p_id: int, data: PortfolioModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    mgr = PortfolioManager(get_db)
    mgr.update(p_id, data.dict())
    broker.publish({"type": "UPDATE_PORTFOLIO", "actor": user.get("userid"), "entity_id": p_id, "title": data.title, "is_active": data.is_active})
    return {"status": "success"}
'''
    if '# --- PORTFOLIO ---' not in html:
        html = html + '\n' + endpoints

    with open('main_api.py', 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == '__main__':
    run()
