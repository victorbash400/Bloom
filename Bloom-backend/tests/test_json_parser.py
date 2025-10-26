"""
Tests for robust JSON parsing utilities
"""

import pytest
from utils.json_parser import (
    clean_json_string,
    count_braces,
    validate_json_structure,
    safe_json_loads,
    extract_json_from_text
)


class TestCleanJsonString:
    def test_basic_cleaning(self):
        """Test basic string cleaning"""
        result = clean_json_string('  {"key": "value"}  ')
        assert result == '{"key": "value"}'
    
    def test_wrapped_quotes(self):
        """Test removal of wrapping quotes"""
        result = clean_json_string('"{\\"key\\": \\"value\\"}"')
        assert '"key"' in result
    
    def test_empty_string(self):
        """Test empty string handling"""
        result = clean_json_string('')
        assert result == '{}'


class TestCountBraces:
    def test_balanced_braces(self):
        """Test counting balanced braces"""
        open_b, close_b, open_br, close_br = count_braces('{"key": [1, 2, 3]}')
        assert open_b == 1
        assert close_b == 1
        assert open_br == 1
        assert close_br == 1
    
    def test_unbalanced_braces(self):
        """Test counting unbalanced braces"""
        open_b, close_b, open_br, close_br = count_braces('{"key": [1, 2, 3}')
        assert open_b == 1
        assert close_b == 1
        assert open_br == 1
        assert close_br == 0


class TestValidateJsonStructure:
    def test_valid_structure(self):
        """Test validation of valid JSON structure"""
        is_valid, error = validate_json_structure('{"key": [1, 2, 3]}')
        assert is_valid is True
        assert error == ''
    
    def test_invalid_braces(self):
        """Test validation with mismatched braces"""
        is_valid, error = validate_json_structure('{"key": "value"')
        assert is_valid is False
        assert 'braces' in error.lower()
    
    def test_invalid_brackets(self):
        """Test validation with mismatched brackets"""
        is_valid, error = validate_json_structure('{"key": [1, 2, 3}')
        assert is_valid is False
        assert 'brackets' in error.lower()


class TestSafeJsonLoads:
    def test_valid_json(self):
        """Test parsing valid JSON"""
        data, error = safe_json_loads('{"key": "value"}')
        assert error is None
        assert data == {"key": "value"}
    
    def test_json_with_newlines(self):
        """Test parsing JSON with newlines"""
        json_str = '{\n  "key": "value",\n  "number": 123\n}'
        data, error = safe_json_loads(json_str)
        assert error is None
        assert data["key"] == "value"
        assert data["number"] == 123
    
    def test_malformed_json(self):
        """Test handling of malformed JSON"""
        data, error = safe_json_loads('{"key": "value"')
        assert error is not None
        assert data is None or isinstance(data, dict)
    
    def test_empty_string(self):
        """Test handling of empty string"""
        data, error = safe_json_loads('')
        assert error is None
        assert data == {}
    
    def test_with_default(self):
        """Test default value on failure"""
        data, error = safe_json_loads('invalid json', default=[])
        assert isinstance(data, list)


class TestExtractJsonFromText:
    def test_extract_object(self):
        """Test extracting JSON object from text"""
        text = 'Some text before {"key": "value"} some text after'
        result = extract_json_from_text(text)
        assert result == '{"key": "value"}'
    
    def test_extract_array(self):
        """Test extracting JSON array from text"""
        text = 'Some text before [1, 2, 3] some text after'
        result = extract_json_from_text(text)
        assert result == '[1, 2, 3]'
    
    def test_no_json(self):
        """Test when no JSON is present"""
        text = 'Just plain text'
        result = extract_json_from_text(text)
        assert result is None
    
    def test_nested_json(self):
        """Test extracting nested JSON"""
        text = 'Text {"outer": {"inner": "value"}} more text'
        result = extract_json_from_text(text)
        assert '{"outer"' in result


class TestRealWorldScenarios:
    def test_widget_response(self):
        """Test parsing a typical widget response"""
        widget_json = '''
        {
            "widget_type": "weather-today",
            "widget_data": {
                "temperature": 25.5,
                "condition": "sunny"
            },
            "message": "Widget created successfully"
        }
        '''
        data, error = safe_json_loads(widget_json)
        assert error is None
        assert data["widget_type"] == "weather-today"
        assert data["widget_data"]["temperature"] == 25.5
    
    def test_escaped_json_string(self):
        """Test parsing JSON with escaped characters"""
        json_str = '{"message": "Line 1\\nLine 2\\nLine 3"}'
        data, error = safe_json_loads(json_str)
        assert error is None
        assert "Line 1" in data["message"]
    
    def test_large_nested_structure(self):
        """Test parsing large nested JSON structure"""
        json_str = '''
        {
            "level1": {
                "level2": {
                    "level3": {
                        "data": [1, 2, 3, 4, 5],
                        "metadata": {
                            "count": 5,
                            "type": "array"
                        }
                    }
                }
            }
        }
        '''
        data, error = safe_json_loads(json_str)
        assert error is None
        assert data["level1"]["level2"]["level3"]["data"] == [1, 2, 3, 4, 5]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
