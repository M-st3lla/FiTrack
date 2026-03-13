import 'package:flutter/material.dart';

class Dashboard extends StatefulWidget {
  const Dashboard({super.key});

  @override
  State<Dashboard> createState() => _DashboardState();
}

class _DashboardState extends State<Dashboard> {
  int _selectedIndex = 0;

  // Example pages within the dashboard
  final List<Widget> _pages = [
    const Center(child: Text('Dashboard Home', style: TextStyle(fontSize: 24))),
    const Center(child: Text('My Listings', style: TextStyle(fontSize: 24))),
    const Center(child: Text('Profile', style: TextStyle(fontSize: 24))),
    const Center(child: Text('Settings', style: TextStyle(fontSize: 24))),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9F5EF), // Vintage cream background
      appBar: AppBar(
        title: const Text(
          'Vintage Auctions Dashboard',
          style: TextStyle(fontFamily: 'Serif', fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFFA0937D), // Dark vintage brown
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        backgroundColor: const Color(0xFFE7D4B5),
        selectedItemColor:
            const Color.fromARGB(255, 44, 146, 139), // Gold accent
        unselectedItemColor: const Color.fromARGB(255, 185, 120, 220),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.gavel), label: 'Listings'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
          BottomNavigationBarItem(
              icon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }
}
