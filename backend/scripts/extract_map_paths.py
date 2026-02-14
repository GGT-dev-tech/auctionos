import re
import os

HTML_FILE = '../mapa_moldal.html'
TARGET_FILE = '../frontend/components/USMap.tsx'

def convert_to_react_attr(match):
    attr = match.group(1)
    value = match.group(2)
    
    # Map common SVG attributes to React equivalents
    replacements = {
        'stroke-width': 'strokeWidth',
        'stroke-linecap': 'strokeLinecap',
        'stroke-linejoin': 'strokeLinejoin',
        'stroke-opacity': 'strokeOpacity',
        'fill-opacity': 'fillOpacity',
        'class': 'className'
    }
    
    if attr in replacements:
        return f'{replacements[attr]}="{value}"'
    return f'{attr}="{value}"'

def main():
    try:
        # Read HTML file
        with open(HTML_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Extract paths using simple string processing or regex
        # Look for <g ...><path ... /g> block or just extract all paths
        # The file content indicates paths are inside <svg><g>...</g></svg>
        
        # Regex to find all <path ... > tags
        path_matches = re.finditer(r'<path\s+([^>]+?)>', content)
        
        paths = []
        for match in path_matches:
            attrs_str = match.group(1)
            
            # Cleaning and converting attributes
            # 1. Replace attributes with React camelCase
            attrs_str = re.sub(r'([a-z]+-[a-z]+)="([^"]*)"', convert_to_react_attr, attrs_str)
            
            # 2. Add/Modify specific attributes
            # Remove existing fill/stroke to allow CSS/Tailwind override if needed, or keep them as defaults
            # The original has fill="#3e4b1a"
            
            # Replace fill color with a default neutral gray for the map
            attrs_str = re.sub(r'fill="[^"]*"', 'fill="#e2e8f0"', attrs_str)
            attrs_str = re.sub(r'stroke="[^"]*"', 'stroke="#cbd5e1"', attrs_str)
            
            # Ensure id property exists and handle jqvmap1_ prefix in the component event handler (already done)
            
            # Parse ID to add simple title/key?
            id_match = re.search(r'id="([^"]*)"', attrs_str)
            key_prop = ""
            if id_match:
                key_prop = f'key="{id_match.group(1)}" '
            
            # Add className for hover effect
            if 'className=' not in attrs_str:
                attrs_str += ' className="hover:fill-blue-500 transition-colors outline-none focus:fill-blue-600"'
            else:
                attrs_str = re.sub(r'className="([^"]*)"', r'className="\1 hover:fill-blue-500 transition-colors outline-none focus:fill-blue-600"', attrs_str)

            paths.append(f'<path {key_prop}{attrs_str}></path>')
            
        if not paths:
            print("No paths found!")
            return

        print(f"Found {len(paths)} paths.")
        
        # Read Target File
        with open(TARGET_FILE, 'r', encoding='utf-8') as f:
            target_content = f.read()
            
        # Inject paths
        # Look for the comment to replace
        placeholder = "{/* I will use the multi_replace tool to insert the rest of the paths from the provided file content since it is too large to fit in this block */}"
        
        # Also remove the manually added paths if they exist to avoid duplication,
        # but my placeholder strategy was to replace that comment.
        # Actually I added two sample paths before the comment. I should probably replace them too or just append.
        # Let's replace the whole content inside <g>...</g> ideally.
        
        start_marker = '<g transform="scale(1) translate(0, 0)">'
        end_marker = '</g>'
        
        new_content_block = start_marker + '\n' + '\n'.join(paths) + '\n' + end_marker
        
        # Regex to replace the g block
        # target_content = re.sub(r'<g transform="scale\(1\) translate\(0, 0\)">.*?</g>', new_content_block, target_content, flags=re.DOTALL)
        
        # Simpler replacement using split/join if regex fails on large content or nested tags (though SVG paths are flat here)
        parts = target_content.split(start_marker)
        if len(parts) > 1:
            pre = parts[0]
            rest = parts[1]
            end_parts = rest.split(end_marker)
            if len(end_parts) > 1:
                post = end_parts[-1]
                
                final_content = pre + new_content_block + post
                
                with open(TARGET_FILE, 'w', encoding='utf-8') as f:
                    f.write(final_content)
                print("Successfully injected paths into USMap.tsx")
            else:
                print("Could not find end marker </g>")
        else:
            print("Could not find start marker")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
