"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";

// MUI Imports
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Divider,
} from "@mui/material";
import {
  Home as HomeIcon,
  People as PeopleIcon,
  ExitToApp as ExitToAppIcon,
  ExpandMore as ExpandMoreIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Tag as TagIcon,
  Brush as BrushIcon,
  Straighten as StraightenIcon,
  Settings as SettingsIcon,
  LocalOffer as LocalOfferIcon,
  Image as ImageIcon,
  Star as StarIcon,
  Article as ArticleIcon,
  Phone as PhoneIcon,
  Store as StoreIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";

const Sidebar = ({ setActiveComponent }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    customers: false,
    products: false,
    orders: false,
    categories: false,
    size: false,
    color: false,
    settings: false,
    coupons: false,
    sliders: false,
    socialmedia: false,
    blog: false,
    reviews: false,
    pages: false,
  });

  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token") || localStorage.getItem("token");
    if (!token) {
      router.push("/admin");
    }
  }, [router]);

  const toggleDropdown = (key) => {
    setIsDropdownOpen((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/admin";
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 250,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 250,
          boxSizing: "border-box",
          bgcolor: "#1a202c", // Darker background for a more elegant look
          color: "white",
          height: "100vh",
          overflowY: "auto",
          // Custom scrollbar styling
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#2d3748", // Track color
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(45deg, #4ade80, #48bb78)", // Gradient thumb
            borderRadius: "10px",
            border: "2px solid #2d3748", // Border around thumb
            "&:hover": {
              background: "linear-gradient(45deg, #48bb78, #4ade80)", // Reverse gradient on hover
            },
          },
          // For Firefox
          scrollbarWidth: "thin",
          scrollbarColor: "#4ade80 #2d3748",
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Image
          width={100}
          height={100}
          src="/store2ulogo.png"
          alt="Profile"
          style={{ borderRadius: "4px", padding: "8px", margin: "0 auto", backgroundColor: "white" }}
        />
        <Typography variant="h6" sx={{ mt: 1, fontWeight: "bold", fontSize: "1.1rem" }}>
          Store2u
        </Typography>
        <Typography variant="body2" sx={{ color: "#4ade80", fontSize: "0.8rem" }}>
          ● Online
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: "#4b5563", my: 1 }} />

      <List sx={{ p: 0 }}>
        {/* Home */}
        <ListItem disablePadding>
          <ListItemButton
            component="a"
            href="/admin/pages/Main"
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px" }}>
              <HomeIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <ListItemText primary="Home" primaryTypographyProps={{ fontSize: "0.9rem" }} />
          </ListItemButton>
        </ListItem>

        {/* Customers Data */}
        <Accordion sx={{ bgcolor: "transparent", color: "white", boxShadow: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "1.2rem" }} />}
            onClick={() => toggleDropdown("customers")}
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px", mr: 0 }}>
              <PeopleIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem" }}>Customers</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "#2d3748" }}>
            <List sx={{ p: 0 }}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/customer"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Customers"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Products */}
        <Accordion sx={{ bgcolor: "transparent", color: "white", boxShadow: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "1.2rem" }} />}
            onClick={() => toggleDropdown("products")}
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px", mr: 0 }}>
              <InventoryIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem" }}>Products</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "#2d3748" }}>
            <List sx={{ p: 0 }}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/Products"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="All Products"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/add-product"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Add Products"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Orders */}
        <Accordion sx={{ bgcolor: "transparent", color: "white", boxShadow: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "1.2rem" }} />}
            onClick={() => toggleDropdown("orders")}
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px", mr: 0 }}>
              <ShoppingCartIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem" }}>Orders</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "#2d3748" }}>
            <List sx={{ p: 0 }}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/orders"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="View Orders"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Categories */}
        <Accordion sx={{ bgcolor: "transparent", color: "white", boxShadow: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "1.2rem" }} />}
            onClick={() => toggleDropdown("categories")}
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px", mr: 0 }}>
              <TagIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem" }}># Category</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "#2d3748" }}>
            <List sx={{ p: 0 }}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/categories"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Categories"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/subcategories"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="SubCategory"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Size */}
        <Accordion sx={{ bgcolor: "transparent", color: "white", boxShadow: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "1.2rem" }} />}
            onClick={() => toggleDropdown("size")}
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px", mr: 0 }}>
              <StraightenIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem" }}>Size</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "#2d3748" }}>
            <List sx={{ p: 0 }}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/size"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Sizes"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Color */}
        <Accordion sx={{ bgcolor: "transparent", color: "white", boxShadow: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "1.2rem" }} />}
            onClick={() => toggleDropdown("color")}
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px", mr: 0 }}>
              <BrushIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem" }}>Color</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "#2d3748" }}>
            <List sx={{ p: 0 }}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/color"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Colors"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Settings */}
        <Accordion sx={{ bgcolor: "transparent", color: "white", boxShadow: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "1.2rem" }} />}
            onClick={() => toggleDropdown("settings")}
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px", mr: 0 }}>
              <SettingsIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem" }}>Settings</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "#2d3748" }}>
            <List sx={{ p: 0 }}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/settings"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Settings"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/facebook-pixel"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Facebook Pixel"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Coupons */}
        <Accordion sx={{ bgcolor: "transparent", color: "white", boxShadow: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "1.2rem" }} />}
            onClick={() => toggleDropdown("coupons")}
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px", mr: 0 }}>
              <LocalOfferIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem" }}>Coupons</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "#2d3748" }}>
            <List sx={{ p: 0 }}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/coupons"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Coupons"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Sliders */}
        <Accordion sx={{ bgcolor: "transparent", color: "white", boxShadow: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "1.2rem" }} />}
            onClick={() => toggleDropdown("sliders")}
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px", mr: 0 }}>
              <ImageIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem" }}>Slider</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "#2d3748" }}>
            <List sx={{ p: 0 }}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/slider"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="View Sliders"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Social Media */}
        <Accordion sx={{ bgcolor: "transparent", color: "white", boxShadow: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "1.2rem" }} />}
            onClick={() => toggleDropdown("socialmedia")}
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px", mr: 0 }}>
              <PeopleIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem" }}>Social Media</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "#2d3748" }}>
            <List sx={{ p: 0 }}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/socialmedia"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Manage Social Media"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Blog */}
        <Accordion sx={{ bgcolor: "transparent", color: "white", boxShadow: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "1.2rem" }} />}
            onClick={() => toggleDropdown("blog")}
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px", mr: 0 }}>
              <ArticleIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem" }}>Blog</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "#2d3748" }}>
            <List sx={{ p: 0 }}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/Blogs"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Add Blog"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/BlogCategory"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Blog Categories"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Customer Reviews */}
        <Accordion sx={{ bgcolor: "transparent", color: "white", boxShadow: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "1.2rem" }} />}
            onClick={() => toggleDropdown("reviews")}
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px", mr: 0 }}>
              <StarIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem" }}>Customer Reviews</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "#2d3748" }}>
            <List sx={{ p: 0 }}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/reviews"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="View Reviews"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Pages */}
        <Accordion sx={{ bgcolor: "transparent", color: "white", boxShadow: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "1.2rem" }} />}
            onClick={() => toggleDropdown("pages")}
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px", mr: 0 }}>
              <DescriptionIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem" }}>Pages</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "#2d3748" }}>
            <List sx={{ p: 0 }}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/addPrivacyPolicy"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Privacy Policy"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/addTermsAndConditions"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Terms & Conditions"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/addShippingPolicy"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Shipping Policy"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/addReturnAndExchangePolicy"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Return & Exchange Policy"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/addAboutUs"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="About Us"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/admin/pages/addContactUs"
                  sx={{
                    py: 0.25,
                    "&:hover": {
                      bgcolor: "#4b5563",
                      "& .MuiListItemText-primary": {
                        color: "#4ade80",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary="Contact Us"
                    sx={{ pl: 4 }}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* FAQs */}
        <ListItem disablePadding>
          <ListItemButton
            component="a"
            href="/admin/pages/addFAQ"
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px" }}>
              <PeopleIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <ListItemText primary="FAQs" primaryTypographyProps={{ fontSize: "0.9rem" }} />
          </ListItemButton>
        </ListItem>

        {/* Contact Info */}
        <ListItem disablePadding>
          <ListItemButton
            component="a"
            href="/admin/pages/addContactInfo"
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px" }}>
              <PhoneIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <ListItemText primary="Contact Info" primaryTypographyProps={{ fontSize: "0.9rem" }} />
          </ListItemButton>
        </ListItem>

        {/* Company Details */}
        <ListItem disablePadding>
          <ListItemButton
            component="a"
            href="/admin/pages/CompanyDetails"
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px" }}>
              <StoreIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <ListItemText primary="Company Details" primaryTypographyProps={{ fontSize: "0.9rem" }} />
          </ListItemButton>
        </ListItem>

        {/* Logout */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              py: 0.5,
              "&:hover": {
                bgcolor: "#2d3748",
                "& .MuiListItemIcon-root": {
                  color: "#4ade80",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: "32px" }}>
              <ExitToAppIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: "0.9rem" }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;