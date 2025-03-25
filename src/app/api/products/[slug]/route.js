import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';
import { stringify } from 'querystring';

// PUT /api/products/[slug]
export async function PUT(request, { params }) {
  try {
    const { slug } = params;
    const {
      name,
      description,
      price,
      stock,
      subcategorySlug,
      colors,
      sizes,
      discount,
      isTopRated = false,
      images, // Array of image filenames
      meta_title,
      meta_description,
      meta_keywords,
      sku,
    } = await request.json();

    // Ensure that images are passed as an array of filenames (without URLs)
    const imageFilenames = images.map((filename) =>
      filename.includes('/') ? filename.split('/').pop() : filename
    );

    console.log("Image filenames being processed:", imageFilenames);

    // Validate image filenames
    if (!Array.isArray(imageFilenames) || imageFilenames.some(filename => typeof filename !== 'string')) {
      throw new Error("Each image must be a valid filename string.");
    }

    // Continue with updating the product using filenames
    const updatedProduct = await prisma.product.update({
      where: { slug },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        subcategorySlug: subcategorySlug,
        colors: JSON.stringify(colors),
        sizes: JSON.stringify(sizes),
        discount: discount ? parseFloat(discount) : null,
        isTopRated,
        meta_title,
        meta_description,
        meta_keywords,
        sku,
        images: {
          deleteMany: {}, // Delete existing images
          create: imageFilenames.map((filename) => ({ url: filename })), // Store only filenames
        },
        updatedAt: new Date(),
      },
    });

    return new Response(JSON.stringify({
      status: 200,
      message: 'Product updated successfully',
      data: updatedProduct,
    }), { status: 200 });

  } catch (error) {
    console.error('Error updating product:', error.message);
    return new Response(JSON.stringify({
      message: 'Failed to update product',
      error: error.message,
    }), { status: 500 });
  }
}



export async function GET(request, { params }) {
  const { slug } = params; // Use slug parameter

  try {
    // Fetch the product by slug
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        subcategory: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found.' },
        { status: 404 }
      );
    }

    // Parse colors and sizes from JSON strings with validation
    let colorIds = [];
    let sizeIds = [];
    
    try {
      colorIds = product.colors ? JSON.parse(product.colors) : [];
      sizeIds = product.sizes ? JSON.parse(product.sizes) : [];
    } catch (parseError) {
      console.error('Error parsing colors or sizes:', parseError);
      // Fallback to empty arrays if parsing fails
      colorIds = [];
      sizeIds = [];
    }

    // Ensure colorIds and sizeIds are arrays of integers
    colorIds = Array.isArray(colorIds) ? colorIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id)) : [];
    sizeIds = Array.isArray(sizeIds) ? sizeIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id)) : [];

    // Fetch color and size details only if there are valid IDs
    const colors = colorIds.length > 0
      ? await prisma.color.findMany({
          where: {
            id: { in: colorIds },
          },
          select: {
            name: true,
            hex: true,
          },
        })
      : [];

    const sizes = sizeIds.length > 0
      ? await prisma.size.findMany({
          where: {
            id: { in: sizeIds },
          },
          select: {
            name: true,
          },
        })
      : [];

    // Fetch related products
    const relatedProducts = await prisma.product.findMany({
      where: {
        subcategorySlug: product.subcategorySlug,
        NOT: { slug: product.slug }, // Exclude the current product
      },
      take: 6, // Limit to 6 related products
      include: {
        images: true,
      },
    });

    return NextResponse.json(
      {
        data: {
          product,
          colors,
          sizes,
          relatedProducts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}



// export async function GET(request, { params }) {
//   const { slug } = params; // Use slug parameter

//   try {
//     // Fetch the product by slug
//     const product = await prisma.product.findUnique({
//       where: { slug },
//       include: {
//         images: true,
//         subcategory: {
//           include: {
//             category: true,
//           },
//         },
//       },
//     });

//     if (!product) {
//       return NextResponse.json(
//         { message: 'Product not found.' },
//         { status: 404 }
//       );
//     }

//     // Parse colors and sizes from JSON strings
//     const colorIds = JSON.parse(product.colors || '[]');
//     const sizeIds = JSON.parse(product.sizes || '[]');

//     // Fetch color and size details
//     const colors = await prisma.color.findMany({
//       where: {
//         id: { in: colorIds },
//       },
//       select: {
//         name: true,
//         hex: true,
//       },
//     });

//     const sizes = await prisma.size.findMany({
//       where: {
//         id: { in: sizeIds },
//       },
//       select: {
//         name: true,
//       },
//     });

//     // Fetch related products (customize the logic as needed)
//     const relatedProducts = await prisma.product.findMany({
//       where: {
//         subcategorySlug: product.subcategorySlug,
//         NOT: { slug: product.slug }, // Exclude the current product
//       },
//       take: 6, // Limit to 6 related products
//       include: {
//         images: true,
//       },
//     });

//     return NextResponse.json(
//       {
//         data: {
//           product,
//           colors,
//           sizes,
//           relatedProducts,
//         },
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error fetching product:', error);
//     return NextResponse.json(
//       { message: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }


export async function DELETE(request, { params }) {
  try {
    const { slug } = params;  // Use slug instead of id

    // Fetch the product by slug to get the id
    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json({
        message: 'Product not found',
        status: false,
      }, { status: 404 });
    }

    await prisma.image.deleteMany({ where: { productId: product.id } });
    await prisma.product.delete({ where: { slug } });

    return NextResponse.json({
      message: 'Product and related data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete product',
        status: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}



// export const config = {
//   api: {
//     bodyParser: true,
//   },
// };

// export async function PUT(request, { params }) {
//   try {
//     const id = parseInt(params.id);
//     const { name, description, price, stock, subcategoryId, colors, sizes, images } = await request.json();

//     const updatedProduct = await prisma.product.update({
//       where: { id: id },
//       data: {
//         name,
//         description,
//         price: parseFloat(price),
//         stock: parseInt(stock),
//         subcategoryId: subcategoryId ? parseInt(subcategoryId) : null,
//         colors: colors ? JSON.parse(colors) : null,
//         sizes: sizes ? JSON.parse(sizes) : null,
//         updatedAt: new Date(),
//       },
//     });

//     if (images && images.length > 0) {
//       await prisma.image.createMany({
//         data: images.map((imageBase64) => ({
//           url: imageBase64,
//           productId: id,
//         })),
//       });
//     }

//     return NextResponse.json(updatedProduct);
//   } catch (error) {
//     console.error('Error updating product:', error);
//     return NextResponse.json(
//       {
//         message: 'Failed to update product',
//         status: false,
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }



// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
//     const name = searchParams.get('search');

//     if (id) {
//       // Fetch the product with its images and subcategory by ID
//       const product = await prisma.product.findUnique({
//         where: { id: parseInt(id) },
//         include: {
//           images: true,
//           subcategory: true,
//         },
//       });

//       if (!product) {
//         return NextResponse.json(
//           { message: 'Product not found', status: false },
//           { status: 404 }
//         );
//       }

//       // Fetch related products based on the same subcategory
//       const relatedProducts = await prisma.product.findMany({
//         where: {
//           subcategoryId: product.subcategoryId,
//           id: { not: parseInt(id) },
//         },
//         include: {
//           images: true,
//         },
//       });

//       return NextResponse.json({ product, relatedProducts });
//     } else if (name) {
//       // Fetch products that match the name search query
//       const products = await prisma.product.findMany({
//         where: {
//           name: {
//             contains: name,
//             mode: 'insensitive', // Case insensitive search
//           },
//         },
//         include: {
//           images: true,
//           subcategory: true,
//         },
//       });

//       return NextResponse.json(products);
//     } else {
//       // Fetch all products if no filter is applied
//       const products = await prisma.product.findMany({
//         include: {
//           images: true,
//           subcategory: true,
//         },
//       });

//       return NextResponse.json(products);
//     }
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     return NextResponse.json(
//       {
//         message: 'Failed to fetch products',
//         status: false,
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }



// export async function GET(request) {
//   const url = new URL(request.url);
//   const searchQuery = url.searchParams.get('search');

//   try {
//     const products = await prisma.product.findMany({
//       where: {
//         name: {
//           contains: searchQuery,
//           mode: 'insensitive', // Case-insensitive search
//         },
//       },
//       include: {
//         images: true,
//       },
//     });

//     return NextResponse.json(products);
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     return NextResponse.json(
//       {
//         message: 'Failed to fetch products',
//         status: false,
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }




// // export async function PUT(request, { params }) {
// //   try {
// //     const id = parseInt(params.id);
// //     const { name, description, price, stock, subcategoryId, colors, sizes, images } = await request.json();
// //     const updatedProduct = await prisma.product.update({
// //       where: { id: id },
// //       data: {
// //         name,
// //         description,
// //         price: parseFloat(price),
// //         stock: parseInt(stock),
// //         subcategoryId: subcategoryId ? parseInt(subcategoryId) : null,
// //         colors: colors ? JSON.parse(colors) : null,
// //         sizes: sizes ? JSON.parse(sizes) : null,
// //         updatedAt: new Date(),
// //       },
// //     });

// //     // Update images
// //     if (images && images.length > 0) {
// //       // Delete existing images
// //       await prisma.image.deleteMany({
// //         where: { productId: id },
// //       });

// //       // Add new images
// //       await prisma.image.createMany({
// //         data: images.map(url => ({
// //           url,
// //           productId: id,
// //         })),
// //       });
// //     }

// //     return NextResponse.json(updatedProduct);
// //   } catch (error) {
// //     console.error('Error updating product:', error);
// //     return NextResponse.json(
// //       {
// //         message: 'Failed to update product',
// //         status: false,
// //         error: error.message,
// //       },
// //       { status: 500 }
// //     );
// //   }
// // }


// // export async function PUT(request, { params }) {
// //   try {
// //     const id = parseInt(params.id);
// //     const { name, description, price, stock, subcategoryId, colors, sizes, images } = await request.json();

// //     const updatedProduct = await prisma.product.update({
// //       where: { id: id },
// //       data: {
// //         name,
// //         description,
// //         price: parseFloat(price),
// //         stock: parseInt(stock),
// //         subcategoryId: subcategoryId ? parseInt(subcategoryId) : null,
// //         colors: colors ? JSON.parse(colors) : null,
// //         sizes: sizes ? JSON.parse(sizes) : null,
// //         updatedAt: new Date(),
// //       },
// //     });

// //     // Add new images without deleting existing ones
// //     if (images && images.length > 0) {
// //       const imageUrls = await Promise.all(images.map(async (image) => {
// //         if (typeof image === 'string') {
// //           return image;
// //         } else if (image.base64) {
// //           const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
// //             method: 'POST',
// //             headers: {
// //               'Content-Type': 'application/json',
// //             },
// //             body: JSON.stringify({ image: image.base64 }),
// //           });
// //           const result = await response.json();
// //           if (response.ok) {
// //             return result.image_url;
// //           } else {
// //             throw new Error(result.error || 'Failed to upload image');
// //           }
// //         }
// //         return null;
// //       }));

// //       const validImageUrls = imageUrls.filter(url => url !== null);

// //       await prisma.image.createMany({
// //         data: validImageUrls.map(url => ({
// //           url,
// //           productId: id,
// //         })),
// //       });
// //       console.log(`Added new images for product ID: ${id}`);
// //     }

// //     return NextResponse.json(updatedProduct);
// //   } catch (error) {
// //     console.error('Error updating product:', error);
// //     return NextResponse.json(
// //       {
// //         message: 'Failed to update product',
// //         status: false,
// //         error: error.message,
// //       },
// //       { status: 500 }
// //     );
// //   }
// // }



// export async function DELETE(request, { params }) {
//   try {
//     const id = parseInt(params.id);

//     // Delete related images first using a raw query
//     await prisma.$executeRaw`DELETE FROM Image WHERE productId = ${id}`;

//     // Now delete the product using a raw query
//     const deletedProduct = await prisma.$executeRaw`DELETE FROM Product WHERE id = ${id}`;

//     return NextResponse.json({ message: 'Product and related images deleted successfully', deletedProduct });
//   } catch (error) {
//     console.error('Error deleting product:', error);
//     return NextResponse.json(
//       {
//         message: 'Failed to delete product',
//         status: false,
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }