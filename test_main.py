import unittest
from unittest.mock import patch
import io
import main

class TestGeometryChecker(unittest.TestCase):

    @patch('builtins.input', side_effect=['5', '5', '5'])
    @patch('sys.stdout', new_callable=io.StringIO)
    def test_equilateral_triangle(self, mock_stdout, mock_input):
        main.check_triangle()
        self.assertIn("It is an equilateral triangle.", mock_stdout.getvalue())

    @patch('builtins.input', side_effect=['5', '5', '3'])
    @patch('sys.stdout', new_callable=io.StringIO)
    def test_isosceles_triangle(self, mock_stdout, mock_input):
        main.check_triangle()
        self.assertIn("It is an isosceles triangle.", mock_stdout.getvalue())

    @patch('builtins.input', side_effect=['-2', '4', '5'])
    @patch('sys.stdout', new_callable=io.StringIO)
    def test_triangle_negative_input(self, mock_stdout, mock_input):
        main.check_triangle()
        self.assertIn("Invalid input: Please make sure all numbers are greater than zero.", mock_stdout.getvalue())

    @patch('builtins.input', side_effect=['1', '2', '10'])
    @patch('sys.stdout', new_callable=io.StringIO)
    def test_triangle_inequality(self, mock_stdout, mock_input):
        main.check_triangle()
        self.assertIn("Error: The given sides cannot form a valid triangle.", mock_stdout.getvalue())

    @patch('builtins.input', side_effect=['4', '4'])
    @patch('sys.stdout', new_callable=io.StringIO)
    def test_square(self, mock_stdout, mock_input):
        main.check_quadrilateral()
        self.assertIn("It is a square.", mock_stdout.getvalue())

    @patch('builtins.input', side_effect=['4', '6'])
    @patch('sys.stdout', new_callable=io.StringIO)
    def test_rectangle(self, mock_stdout, mock_input):
        main.check_quadrilateral()
        self.assertIn("It is a rectangle.", mock_stdout.getvalue())

    @patch('builtins.input', side_effect=['0', '5'])
    @patch('sys.stdout', new_callable=io.StringIO)
    def test_quadrilateral_zero_input(self, mock_stdout, mock_input):
        main.check_quadrilateral()
        self.assertIn("Invalid input: Please make sure both length and width are greater than zero.", mock_stdout.getvalue())

if __name__ == '__main__':
    unittest.main()
