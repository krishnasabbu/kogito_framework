# React Flow Graph - Interaction Guide

## ✅ **FIXED: Nodes Are Now Fully Draggable!**

The graph is now **fully interactive** with complete free-hand movement. You have total control over node positioning!

---

## 🎮 Interactive Controls

### **1. Drag Nodes Freely** ✨
- **Click and hold** any node
- **Drag** to any position on the canvas
- Nodes stay where you put them
- Edges automatically adjust

### **2. Pan the Canvas**
- **Click and drag** on empty space
- Or use **mouse wheel + drag**
- Move the entire view around

### **3. Zoom In/Out**
- **Mouse wheel** to zoom
- **Control panel** buttons (bottom-left)
- **Pinch to zoom** (touchpad)
- Zoom range: 10% to 200%

### **4. Select Nodes**
- **Click** any node to select it
- Selected node shows detailed metrics
- **Click canvas** to deselect

### **5. Reset View**
- Click **"Fit View"** button in controls
- Resets to optimal zoom and position
- Shows all nodes in viewport

---

## 🎯 What You Can Do

### **Reorganize the Layout**
```
Before:                  After (Your Custom Layout):

Champion  Challenge      Challenge    Champion
   |         |              |            |
   ↓         ↓              ↓            ↓
   ●         ●              ●      ●     ●
   |         |                    / \
   ↓         ↓              ●  ←  ●   ●
   ●         ●                        |
                                      ↓
                                      ●
```

Move nodes anywhere to create your preferred visualization!

### **Group Similar Nodes**
- Drag related nodes closer together
- Create visual groupings
- Separate different workflow stages

### **Highlight Comparisons**
- Position champion/challenge nodes side-by-side
- Make time differences more visible
- Create custom comparison views

### **Focus on Problem Areas**
- Move error nodes to the front
- Group slow-performing nodes
- Isolate specific workflow sections

---

## 🖱️ Mouse Controls

| Action | Result |
|--------|--------|
| **Click node + Drag** | Move node to new position |
| **Click empty space + Drag** | Pan canvas view |
| **Mouse wheel scroll** | Zoom in/out |
| **Click node** | Select and view details |
| **Click canvas** | Deselect node |
| **Double click** | Fit view to content |

---

## ⌨️ Keyboard Shortcuts (React Flow Default)

| Key | Action |
|-----|--------|
| **Space + Drag** | Pan canvas |
| **Ctrl + Scroll** | Zoom faster |
| **Shift + Select** | Multi-select nodes |

---

## 📊 Visual Features

### **Color Coding**
- 🔴 **Wells Red** - Champion nodes
- 🟡 **Wells Gold** - Challenge nodes
- ⚫ **Gray Dashed** - Comparison lines with time differences

### **Animated Edges**
- ✅ **Flowing animation** - Successful execution
- ❌ **Static red** - Error in execution

### **Node Status**
- ✅ **Green border** - Success
- ❌ **Red border** - Error
- ⚠️ **Yellow border** - Skipped

### **Time Differences**
- Labels on comparison lines show: `Δ XXXms`
- Instantly see performance gaps

---

## 🎨 Canvas Features

### **Legend Card (Top-Left)**
Shows:
- Champion/Challenge color coding
- Quick tip: "💡 Drag nodes to reposition"

### **Summary Card (Top-Right)**
Shows:
- Total Champion execution time
- Total Challenge execution time
- Time difference between variants

### **Mini-Map (Bottom-Right)**
- Overview of entire graph
- Color-coded nodes (Red/Gold)
- Click to jump to that area

### **Controls (Bottom-Left)**
- ➕ Zoom In
- ➖ Zoom Out
- 🔄 Fit View
- 🔒 Lock (disable interactions)

---

## 💡 Pro Tips

### **1. Create Custom Layouts**
Drag nodes to match your mental model:
- Vertical flow for sequential steps
- Horizontal comparison for side-by-side
- Grouped by error/success status
- Clustered by execution time

### **2. Use Mini-Map for Navigation**
- See entire graph at once
- Click mini-map to jump to area
- Keep track of your position

### **3. Zoom for Details**
- Zoom in to read node details
- Zoom out for big picture
- Use mouse wheel for quick zoom

### **4. Reset When Needed**
- Click "Fit View" to reset
- Useful after major reorganization
- Quick way to see everything

### **5. Select Nodes for Metrics**
- Click node to see detailed panel
- View request/response JSON
- Compare with opposite variant

---

## 🔥 Common Use Cases

### **Use Case 1: Find Performance Bottlenecks**
1. Look at execution times in node labels
2. Drag slower nodes to the top
3. Group by performance tier
4. Identify patterns

### **Use Case 2: Compare Variants**
1. Align champion/challenge nodes horizontally
2. Compare execution times
3. Look at dashed comparison lines
4. Find biggest differences

### **Use Case 3: Error Analysis**
1. Find red-bordered nodes (errors)
2. Drag error nodes together
3. Check error messages
4. Compare error rates

### **Use Case 4: Workflow Understanding**
1. Follow animated edges
2. Trace execution flow
3. Identify decision points (gateways)
4. Map dependencies

### **Use Case 5: Presentation Mode**
1. Create optimal layout for stakeholders
2. Group related concepts
3. Highlight key comparisons
4. Use zoom for emphasis

---

## 🐛 Troubleshooting

### **"Nodes won't move"**
✅ **Fixed!** Nodes should now drag smoothly.

If still having issues:
- Check that you're clicking the node itself (not edge)
- Try refreshing the browser
- Check browser console for errors

### **"Canvas won't pan"**
- Click and drag on **empty space** (not on nodes)
- Or use space bar + drag
- Check mini-map is not blocking area

### **"Lost my nodes!"**
- Click **"Fit View"** button (bottom-left)
- Or zoom out to find them
- Check mini-map for overview

### **"Edges look weird after moving"**
- Edges auto-adjust to node positions
- This is normal behavior
- They connect source to target automatically

---

## 📐 Technical Details

### **What Changed**
Before:
```typescript
const onNodesChange = useCallback(() => {}, []); // Empty - did nothing!
```

After:
```typescript
const onNodesChange = useCallback(
  (changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds)); // Properly updates positions!
  },
  []
);
```

### **State Management**
- Nodes stored in React state
- Position updates persist during session
- Edges recalculate automatically
- Full React Flow v10 integration

### **Node Configuration**
```typescript
{
  draggable: true,          // ✅ Nodes can be dragged
  selectable: true,         // ✅ Nodes can be selected
  connectable: false,       // ❌ Can't create new edges
}
```

---

## 🎯 Quick Start

**5 Steps to Start Visualizing:**

1. **Open execution** - Click any execution in list
2. **Go to Flow tab** - Select "Flow Visualization"
3. **Drag a node** - Click and drag any node
4. **Watch edges adjust** - Connections follow automatically
5. **Create your layout** - Organize however you want!

---

## ✨ Summary

**What Works Now:**
- ✅ **Fully draggable nodes** with smooth interaction
- ✅ **Pan & zoom** canvas for exploration
- ✅ **Auto-adjusting edges** that follow nodes
- ✅ **Mini-map** for navigation
- ✅ **Controls** for zoom and fit view
- ✅ **Selection** to view node details
- ✅ **Wells Fargo branding** throughout

**You have complete freedom to:**
- Drag nodes anywhere on canvas
- Create custom layouts
- Group and organize as needed
- Focus on specific areas
- Compare variants your way

**The graph is now your canvas! 🎨**

---

**Last Updated**: 2025-10-07
**Status**: ✅ FULLY INTERACTIVE
**Try it now**: Open any execution and start dragging nodes!
