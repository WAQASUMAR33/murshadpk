import prisma from '../../../../util/prisma';

// Fetch user orders by user slug
export async function GET(req, { params }) {
  try {
    // Extract the slug from the dynamic route parameters
    const { id } = params;

    // Validate slug
    if (!id) {
      return new Response(JSON.stringify({ message: 'User slug is required' }), { status: 400 });
    }

   

    // Fetch orders for the user's userId
    const orders = await prisma.Order.findMany({
        include: {
            orderItems: {
              include: {
                product: {
                  include: {
                    images: {
                      take: 1 // Take only the first image
                    }
                  }
                }
              },
            },
          },
      where: { userId: parseInt( id) }
    });

    // Check if orders exist
    if (!orders || orders.length === 0) {
      return new Response(JSON.stringify({ message: 'No orders found for this user' }), { status: 404 });
    }

    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return new Response(JSON.stringify({ message: 'Failed to fetch orders' }), { status: 500 });
  }
}