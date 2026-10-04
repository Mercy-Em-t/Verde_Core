def run():
    with open('main_api.py', 'r', encoding='utf-8') as f:
        html = f.read()

    old_create = 'svc_id = catalog.create_service(data.name, data.description, data.price)\n    return {"status": "success", "service_id": svc_id, "msg": "Service published to website"}'
    new_create = 'svc_id = catalog.create_service(data.name, data.description, data.price)\n    broker.publish({"type": "CREATE_SERVICE", "actor": user.get("userid"), "entity_id": svc_id, "name": data.name, "price": data.price})\n    return {"status": "success", "service_id": svc_id, "msg": "Service published to website"}'
    html = html.replace(old_create, new_create)

    old_update = 'catalog.update_service(service_id, data.name, data.description, data.price, data.is_active)\n    return {"status": "success", "msg": "Service updated successfully"}'
    new_update = 'catalog.update_service(service_id, data.name, data.description, data.price, data.is_active)\n    broker.publish({"type": "UPDATE_SERVICE", "actor": user.get("userid"), "entity_id": service_id, "name": data.name, "price": data.price, "is_active": data.is_active})\n    return {"status": "success", "msg": "Service updated successfully"}'
    html = html.replace(old_update, new_update)

    with open('main_api.py', 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == '__main__':
    run()
