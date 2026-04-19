import 'package:flutter/material.dart';
import 'dart:async';
import 'package:get/get.dart';
import '../controllers/auctionitemscontroller.dart';

class AuctionItems extends StatefulWidget {
  const AuctionItems({super.key});

  @override
  State<AuctionItems> createState() => _AuctionItemsState();
}

enum _SortOption { newest, endingSoon, priceLow, priceHigh }

extension _SortLabel on _SortOption {
  String get label {
    switch (this) {
      case _SortOption.newest:
        return 'Newest';
      case _SortOption.endingSoon:
        return 'Ending soon';
      case _SortOption.priceLow:
        return 'Price: low → high';
      case _SortOption.priceHigh:
        return 'Price: high → low';
    }
  }
}

class _AuctionItemsState extends State<AuctionItems> {
  final AuctionController controller = Get.put(AuctionController());

  final Color vintageBrown = const Color(0xFFF7E7CB);
  final Color sageGreen = const Color(0xFFA3B18A);

  @override
  void initState() {
    super.initState();
    controller.fetchAuctionItems();
  }

  void _showSnack(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: sageGreen.withOpacity(0.25),
      appBar: AppBar(
        title: const Text("Auction Items"),
        backgroundColor: const Color(0xFF703323).withOpacity(0.4),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(10),
            child: TextField(
              onChanged: controller.filterItems,
              decoration: InputDecoration(
                hintText: "Search items...",
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
          Obx(() => _SortFilterBar(
                sortOption:
                    _SortOption.values[controller.sortOption.value.index],
                selectedCategory: controller.selectedCategory.value,
                categories: controller.categories,
                itemCount: controller.displayedItems.length,
                vintageBrown: vintageBrown,
                onSortChanged: (v) {
                  controller.sortOption.value = SortOption.values[v.index];
                  controller.applyFilters();
                },
                onCategoryChanged: (v) {
                  controller.selectedCategory.value = v;
                  controller.applyFilters();
                },
              )),
          Expanded(
            child: Obx(() {
              if (controller.displayedItems.isEmpty) {
                return const Center(child: CircularProgressIndicator());
              }

              return GridView.builder(
                padding: const EdgeInsets.all(10),
                itemCount: controller.displayedItems.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 10,
                  crossAxisSpacing: 10,
                  childAspectRatio: 0.65,
                ),
                itemBuilder: (context, i) {
                  final item = controller.displayedItems[i];
                  final itemId = item["id"];

                  return Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: sageGreen.withOpacity(0.45),
                      border: Border.all(color: vintageBrown, width: 1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => _showItemDialog(item),
                            child: Container(
                              width: double.infinity,
                              alignment: Alignment.topCenter,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                color: Colors.grey.shade300,
                                image: (item["img"] as String).isNotEmpty
                                    ? DecorationImage(
                                        image: NetworkImage(item["img"]),
                                        fit: BoxFit.cover,
                                      )
                                    : null,
                              ),
                              child: (item["img"] as String).isEmpty
                                  ? const Center(
                                      child: Icon(Icons.image_not_supported,
                                          color: Colors.grey))
                                  : null,
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          item["name"],
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        const Divider(color: Colors.black26),
                        Text(
                          "Price: Ksh ${item["price"]}",
                          style: TextStyle(
                            color: const Color(0xFF703323).withOpacity(0.8),
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                        const Divider(color: Colors.black26),
                        Text(
                          "Highest bid: Ksh ${item["bid"]}",
                          style: const TextStyle(
                            fontSize: 15,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                        const SizedBox(height: 4),
                        _CountdownText(endTime: item["endTime"]),
                        const SizedBox(height: 6),
                        TextField(
                          keyboardType: TextInputType.number,
                          onChanged: (val) =>
                              controller.bidValues[itemId] = val,
                          decoration: InputDecoration(
                            hintText: "Min: Ksh ${item["bid"]}",
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 8,
                            ),
                            border: const OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: vintageBrown,
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              elevation: 2,
                            ),
                            onPressed: () async {
                              final msg = await controller.submitBid(
                                  item, controller.bidValues[itemId] ?? '');
                              _showSnack(msg);
                            },
                            child: const Text(
                              "Bid",
                              style: TextStyle(
                                color: Color(0xFFB3684D),
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              );
            }),
          ),
        ],
      ),
    );
  }

  void _showItemDialog(Map<String, dynamic> item) {
    showDialog(
      context: context,
      builder: (_) {
        final screenHeight = MediaQuery.of(context).size.height;
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 32),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Container(
              color: const Color(0xFF1A1A1A),
              constraints: BoxConstraints(maxHeight: screenHeight * 0.90),
              child: Column(
                children: [
                  Flexible(
                    child: SingleChildScrollView(
                      child: Column(
                        children: [
                          Image.network(
                            item["img"],
                            width: double.infinity,
                            fit: BoxFit.contain,
                          ),
                          Container(
                            color: const Color(0xFF2A2A2A),
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item["name"],
                                    style: const TextStyle(
                                        color: Color(0xFFF7E7CB),
                                        fontWeight: FontWeight.bold)),
                                const SizedBox(height: 10),
                                Text(item["description"] ?? "",
                                    style:
                                        const TextStyle(color: Colors.white70)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text("Close"),
                  )
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _SortFilterBar extends StatelessWidget {
  final _SortOption sortOption;
  final String selectedCategory;
  final List<String> categories;
  final int itemCount;
  final Color vintageBrown;
  final ValueChanged<_SortOption> onSortChanged;
  final ValueChanged<String> onCategoryChanged;

  const _SortFilterBar({
    required this.sortOption,
    required this.selectedCategory,
    required this.categories,
    required this.itemCount,
    required this.vintageBrown,
    required this.onSortChanged,
    required this.onCategoryChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white.withOpacity(0.55),
      padding: const EdgeInsets.fromLTRB(12, 6, 12, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('Sort:',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(width: 8),
              Expanded(
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<_SortOption>(
                    value: sortOption,
                    isDense: true,
                    borderRadius: BorderRadius.circular(8),
                    items: _SortOption.values
                        .map((s) => DropdownMenuItem(
                              value: s,
                              child: Text(s.label,
                                  style: const TextStyle(fontSize: 13)),
                            ))
                        .toList(),
                    onChanged: (v) {
                      if (v != null) onSortChanged(v);
                    },
                  ),
                ),
              ),
              Text('$itemCount items',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600])),
            ],
          ),
          const SizedBox(height: 6),
          SizedBox(
            height: 32,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 6),
              itemBuilder: (_, i) {
                final cat = categories[i];
                final selected = selectedCategory == cat;
                return ChoiceChip(
                  label: Text(cat, style: const TextStyle(fontSize: 12)),
                  selected: selected,
                  selectedColor: const Color(0xFF703323).withOpacity(0.75),
                  backgroundColor: vintageBrown,
                  labelStyle: TextStyle(
                    color: selected ? Colors.white : const Color(0xFF703323),
                    fontWeight: FontWeight.w500,
                  ),
                  onSelected: (_) => onCategoryChanged(cat),
                  visualDensity: VisualDensity.compact,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _CountdownText extends StatefulWidget {
  final DateTime endTime;
  const _CountdownText({required this.endTime});

  @override
  State<_CountdownText> createState() => _CountdownTextState();
}

class _CountdownTextState extends State<_CountdownText> {
  late Timer _timer;
  late String _timeLeft;

  String _getTimeLeft() {
    final difference = widget.endTime.difference(DateTime.now());
    if (difference.isNegative) return "Ended";
    final days = difference.inDays;
    final hours = difference.inHours % 24;
    final minutes = difference.inMinutes % 60;
    final seconds = difference.inSeconds % 60;
    return "${days}d ${hours}h ${minutes}m ${seconds}s";
  }

  @override
  void initState() {
    super.initState();
    _timeLeft = _getTimeLeft();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _timeLeft = _getTimeLeft());
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Text(
      "Ends in: $_timeLeft",
      style: const TextStyle(
        color: Colors.red,
        fontWeight: FontWeight.bold,
      ),
    );
  }
}
