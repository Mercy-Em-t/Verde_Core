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

def check_quadrilateral():
    try:
        length = int(input("Enter length: "))
        width = int(input("Enter width: "))
    except ValueError:
        print("Error: Inputs must be integers.")
        return

    # Check if numbers are positive
    if length <= 0 or width <= 0:
        print("Invalid input: Please make sure both length and width are greater than zero.")
        return

    # Check if square or rectangle
    if length == width:
        print("It is a square.")
    else:
        print("It is a rectangle.")

def main():
    print("--- Shape Checker ---")
    while True:
        print("\nWhat would you like to check?")
        print("1. Triangle")
        print("2. Quadrilateral")
        print("3. Exit")
        choice = input("Enter your choice (1-3): ")

        if choice == '1':
            check_triangle()
        elif choice == '2':
            check_quadrilateral()
        elif choice == '3':
            print("Goodbye!")
	  
     
            
        else:
            print("Invalid choice, please select 1, 2, or 3.")

if __name__ == "__main__":
    main()
