"""
Report Generation Tool for Bloom Agents
Generates professional PDF reports using markdown.
"""

import os
import json
from datetime import datetime
import markdown2
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from html.parser import HTMLParser

# Create reports directory
REPORTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'reports')
os.makedirs(REPORTS_DIR, exist_ok=True)


class HTMLToReportLab(HTMLParser):
    """Simple HTML parser to convert HTML to ReportLab flowables"""
    
    def __init__(self, styles):
        super().__init__()
        self.styles = styles
        self.story = []
        self.current_text = []
        self.current_style = 'Normal'
        self.in_list = False
        self.list_items = []
        self.table_data = []
        self.in_table = False
        self.current_row = []
        
    def handle_starttag(self, tag, attrs):
        if tag == 'h1':
            self.current_style = 'Heading1'
        elif tag == 'h2':
            self.current_style = 'Heading2'
        elif tag == 'h3':
            self.current_style = 'Heading3'
        elif tag in ['ul', 'ol']:
            self.in_list = True
            self.list_items = []
        elif tag == 'table':
            self.in_table = True
            self.table_data = []
        elif tag == 'tr':
            self.current_row = []
        elif tag == 'strong':
            self.current_text.append('<b>')
        elif tag == 'em':
            self.current_text.append('<i>')
            
    def handle_endtag(self, tag):
        if tag in ['h1', 'h2', 'h3', 'p']:
            if self.current_text:
                text = ''.join(self.current_text).strip()
                if text:
                    self.story.append(Paragraph(text, self.styles[self.current_style]))
                    self.story.append(Spacer(1, 0.1*inch))
                self.current_text = []
            self.current_style = 'Normal'
        elif tag in ['ul', 'ol']:
            if self.list_items:
                for item in self.list_items:
                    self.story.append(Paragraph(f"• {item}", self.styles['Normal']))
                self.story.append(Spacer(1, 0.1*inch))
            self.in_list = False
            self.list_items = []
        elif tag == 'li':
            if self.current_text:
                self.list_items.append(''.join(self.current_text).strip())
                self.current_text = []
        elif tag == 'table':
            if self.table_data:
                # Calculate available width (letter size minus margins)
                available_width = letter[0] - 144  # 72pt margins on each side
                
                # Calculate column widths based on number of columns
                num_cols = len(self.table_data[0]) if self.table_data else 1
                col_width = available_width / num_cols
                
                # Wrap text in cells with Paragraph for better formatting
                wrapped_data = []
                for row in self.table_data:
                    wrapped_row = []
                    for cell in row:
                        # Use smaller font for table cells to fit more content
                        wrapped_row.append(Paragraph(str(cell), self.styles['Normal']))
                    wrapped_data.append(wrapped_row)
                
                t = Table(wrapped_data, colWidths=[col_width] * num_cols)
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#D3E1C4')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#00311e')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 12),
                    ('FONTSIZE', (0, 1), (-1, -1), 11),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 6),
                    ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')])
                ]))
                self.story.append(t)
                self.story.append(Spacer(1, 0.2*inch))
            self.in_table = False
            self.table_data = []
        elif tag == 'tr':
            if self.current_row:
                self.table_data.append(self.current_row)
                self.current_row = []
        elif tag in ['td', 'th']:
            if self.current_text:
                self.current_row.append(''.join(self.current_text).strip())
                self.current_text = []
        elif tag == 'strong':
            self.current_text.append('</b>')
        elif tag == 'em':
            self.current_text.append('</i>')
        elif tag == 'hr':
            self.story.append(Spacer(1, 0.2*inch))
            
    def handle_data(self, data):
        if data.strip():
            self.current_text.append(data)


def generate_farm_report(report_content: str) -> str:
    """
    Generate a professional PDF report from markdown content.
    
    Args:
        report_content: Markdown-formatted report content
    
    Returns:
        JSON string with download URL
    """
    
    try:
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"farm_report_{timestamp}.pdf"
        filepath = os.path.join(REPORTS_DIR, filename)
        
        # Clean up markdown content (fix common formatting issues)
        # Remove backslash escapes in tables that break rendering
        cleaned_content = report_content.replace('|\\', '|').replace('\\\n', '\n')
        
        # Convert markdown to HTML
        html_content = markdown2.markdown(cleaned_content, extras=['tables', 'fenced-code-blocks'])
        
        # Create PDF document
        doc = SimpleDocTemplate(filepath, pagesize=letter,
                              rightMargin=72, leftMargin=72,
                              topMargin=72, bottomMargin=72)
        
        # Define styles
        styles = getSampleStyleSheet()
        
        # Custom styles
        styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#00311e'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        styles['Heading1'].textColor = colors.HexColor('#00311e')
        styles['Heading1'].fontSize = 20
        styles['Heading1'].spaceAfter = 12
        
        styles['Heading2'].textColor = colors.HexColor('#00311e')
        styles['Heading2'].fontSize = 16
        styles['Heading2'].spaceAfter = 10
        
        styles['Heading3'].textColor = colors.HexColor('#00311e')
        styles['Heading3'].fontSize = 14
        styles['Heading3'].spaceAfter = 8
        
        styles['Normal'].fontSize = 11
        styles['Normal'].leading = 14
        
        # Build story
        story = []
        
        # Add header
        story.append(Paragraph("🌱 Bloom Farm Report", styles['CustomTitle']))
        story.append(Paragraph(
            f"Generated: {datetime.now().strftime('%B %d, %Y')}",
            ParagraphStyle('DateStyle', parent=styles['Normal'], 
                          alignment=TA_CENTER, textColor=colors.grey, fontSize=10)
        ))
        story.append(Spacer(1, 0.3*inch))
        
        # Parse HTML and add to story
        parser = HTMLToReportLab(styles)
        parser.feed(html_content)
        story.extend(parser.story)
        
        # Add footer
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph(
            "<i>Generated by Bloom AI Farming Assistant</i>",
            ParagraphStyle('FooterStyle', parent=styles['Normal'],
                          alignment=TA_CENTER, textColor=colors.grey, fontSize=9)
        ))
        
        # Build PDF
        doc.build(story)
        
        # Get the base URL from environment or use default
        base_url = os.environ.get('API_BASE_URL', 'https://bloomapi-643988926049.europe-west1.run.app')
        
        return json.dumps({
            "report_generated": True,
            "filename": filename,
            "download_url": f"{base_url}/api/reports/{filename}",
            "message": "Report generated successfully! Click the link above to download."
        })
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return json.dumps({
            "report_generated": False,
            "error": str(e),
            "message": f"Failed to generate report: {str(e)}"
        })

# Export
__all__ = ['generate_farm_report']
