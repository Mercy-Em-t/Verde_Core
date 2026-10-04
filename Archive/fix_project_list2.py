def run():
    with open('client-dashboard.html', 'r', encoding='utf-8') as f:
        html = f.read()

    start_idx = html.find('<!-- Project Card 1 -->')
    end_idx = html.find('<!-- Right Column: RACI Action Center -->')

    if start_idx != -1 and end_idx != -1:
        new_html = html[:start_idx] + '<div id="project-list" class="space-y-6"></div>\n        </div>\n\n        ' + html[end_idx:]
        with open('client-dashboard.html', 'w', encoding='utf-8') as f:
            f.write(new_html)
        print("Success")
    else:
        print("Could not find markers")

if __name__ == '__main__':
    run()
