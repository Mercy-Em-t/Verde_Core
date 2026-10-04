def check_triangle():
    try:
        a = int(input("Enter first side: "))
        b = int(input("Enter second side: "))
        c = int(input("Enter third side: "))
    except ValueError:
        print("Error: Inputs must be integers.")
        return

    # Check if numbers are positive
    if a <= 0 or b <= 0 or c <= 0:
        print("Invalid input: Please make sure all numbers are greater than zero.")
        return
        
    # Check if they can form a triangle (triangle inequality theorem)
    if (a + b <= c) or (a + c <= b) or (b + c <= a):
        print("Error: The given sides cannot form a valid triangle.")
        return
        
    # Check if equilateral
    if a == b == c:
        print("It is an equilateral triangle.")
    # Check if isosceles
    elif a == b or b == c or a == c:
        print("It is an isosceles triangle.")
    # Otherwise, scalene
    else:
        print("It is a scalene triangle.")

check_triangle()
