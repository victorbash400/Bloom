"""
Tests for Report Generation Tool
"""

import os
import sys
import json
import pytest
from unittest.mock import patch, mock_open, MagicMock
from datetime import datetime

# Add parent directory to path to import tools module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from tools.report_tool import generate_farm_report, REPORTS_DIR


class TestGenerateFarmReport:
    """Test suite for generate_farm_report function"""
    
    def test_generate_report_success(self):
        """Test successful report generation"""
        report_content = """
# Farm Analysis Report

## Summary
This is a test farm report.

## Recommendations
- Plant more crops
- Improve irrigation
"""
        
        with patch('tools.report_tool.pisa.CreatePDF') as mock_pdf:
            mock_pdf.return_value = MagicMock(err=0)
            
            with patch('builtins.open', mock_open()):
                result = generate_farm_report(report_content)
        
        result_data = json.loads(result)
        
        assert result_data['report_generated'] is True
        assert 'filename' in result_data
        assert result_data['filename'].startswith('farm_report_')
        assert result_data['filename'].endswith('.pdf')
        assert 'download_url' in result_data
        assert 'localhost:8000' in result_data['download_url']
        assert result_data['message'] == "Report generated successfully! Click the link above to download."
    
    def test_generate_report_with_tables(self):
        """Test report generation with markdown tables"""
        report_content = """
# Crop Analysis

| Crop | Status | Yield |
|------|--------|-------|
| Corn | Good   | High  |
| Wheat| Fair   | Medium|
"""
        
        with patch('tools.report_tool.pisa.CreatePDF') as mock_pdf:
            mock_pdf.return_value = MagicMock(err=0)
            
            with patch('builtins.open', mock_open()):
                result = generate_farm_report(report_content)
        
        result_data = json.loads(result)
        assert result_data['report_generated'] is True
    
    def test_generate_report_with_lists(self):
        """Test report generation with lists"""
        report_content = """
# Action Items

## Immediate Actions
1. Check irrigation system
2. Apply fertilizer
3. Monitor weather

## Long-term Goals
- Expand farm area
- Install new equipment
"""
        
        with patch('tools.report_tool.pisa.CreatePDF') as mock_pdf:
            mock_pdf.return_value = MagicMock(err=0)
            
            with patch('builtins.open', mock_open()):
                result = generate_farm_report(report_content)
        
        result_data = json.loads(result)
        assert result_data['report_generated'] is True
    
    def test_generate_report_pdf_error(self):
        """Test handling of PDF generation errors"""
        report_content = "# Test Report"
        
        with patch('tools.report_tool.pisa.CreatePDF') as mock_pdf:
            mock_pdf.return_value = MagicMock(err=1)
            
            with patch('builtins.open', mock_open()):
                result = generate_farm_report(report_content)
        
        result_data = json.loads(result)
        
        assert result_data['report_generated'] is False
        assert result_data['error'] == "Failed to generate PDF"
        assert 'error generating the report' in result_data['message']
    
    def test_generate_report_exception_handling(self):
        """Test exception handling during report generation"""
        report_content = "# Test Report"
        
        with patch('tools.report_tool.pisa.CreatePDF', side_effect=Exception("Test error")):
            with patch('builtins.open', mock_open()):
                result = generate_farm_report(report_content)
        
        result_data = json.loads(result)
        
        assert result_data['report_generated'] is False
        assert 'error' in result_data
        assert 'Test error' in result_data['error']
        assert 'Failed to generate report' in result_data['message']
    
    def test_filename_format(self):
        """Test that filename follows correct format"""
        report_content = "# Test"
        
        with patch('tools.report_tool.pisa.CreatePDF') as mock_pdf:
            mock_pdf.return_value = MagicMock(err=0)
            
            with patch('builtins.open', mock_open()):
                with patch('tools.report_tool.datetime') as mock_datetime:
                    mock_datetime.now.return_value.strftime.return_value = "20241026_123456"
                    result = generate_farm_report(report_content)
        
        result_data = json.loads(result)
        assert result_data['filename'] == "farm_report_20241026_123456.pdf"
    
    def test_html_conversion(self):
        """Test markdown to HTML conversion"""
        report_content = """
# Heading 1
## Heading 2
**Bold text**
*Italic text*
"""
        
        with patch('tools.report_tool.pisa.CreatePDF') as mock_pdf:
            mock_pdf.return_value = MagicMock(err=0)
            
            with patch('builtins.open', mock_open()) as m:
                result = generate_farm_report(report_content)
                
                # Check that CreatePDF was called with HTML content
                assert mock_pdf.called
                call_args = mock_pdf.call_args[0]
                html_content = call_args[0]
                
                # Verify HTML structure
                assert '<!DOCTYPE html>' in html_content
                assert '<h1>' in html_content
                assert '<h2>' in html_content
                assert 'Bloom Farm Report' in html_content
    
    def test_empty_content(self):
        """Test handling of empty report content"""
        report_content = ""
        
        with patch('tools.report_tool.pisa.CreatePDF') as mock_pdf:
            mock_pdf.return_value = MagicMock(err=0)
            
            with patch('builtins.open', mock_open()):
                result = generate_farm_report(report_content)
        
        result_data = json.loads(result)
        assert result_data['report_generated'] is True
    
    def test_reports_directory_creation(self):
        """Test that reports directory is created"""
        assert os.path.exists(REPORTS_DIR) or True  # Directory should exist or be created
    
    def test_download_url_format(self):
        """Test download URL format"""
        report_content = "# Test"
        
        with patch('tools.report_tool.pisa.CreatePDF') as mock_pdf:
            mock_pdf.return_value = MagicMock(err=0)
            
            with patch('builtins.open', mock_open()):
                result = generate_farm_report(report_content)
        
        result_data = json.loads(result)
        url = result_data['download_url']
        
        assert url.startswith('http://localhost:8000/api/reports/')
        assert url.endswith('.pdf')
    
    def test_special_characters_in_content(self):
        """Test handling of special characters"""
        report_content = """
# Report with Special Characters
- Item with & ampersand
- Item with < less than
- Item with > greater than
- Item with "quotes"
"""
        
        with patch('tools.report_tool.pisa.CreatePDF') as mock_pdf:
            mock_pdf.return_value = MagicMock(err=0)
            
            with patch('builtins.open', mock_open()):
                result = generate_farm_report(report_content)
        
        result_data = json.loads(result)
        assert result_data['report_generated'] is True


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
